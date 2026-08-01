#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const specPath = resolve(repositoryRoot, "spec/roxy-api.json");
const checkOnly = process.argv.includes("--check");

function fail(message) {
  throw new Error(`Invalid API source: ${message}`);
}

function localize(value, locale) {
  return value?.[locale] ?? "";
}

function localizedExample(examples, locale) {
  return examples.shared ?? examples[locale];
}

function referencedSchemaName(node) {
  return node?.$ref?.startsWith("#/schemas/") ? node.$ref.slice("#/schemas/".length) : undefined;
}

function resolveSchema(spec, node) {
  const name = referencedSchemaName(node);
  if (!name) return node;
  const schema = spec.schemas[name];
  if (!schema) fail(`unknown schema reference ${node.$ref}`);
  return schema;
}

function visitSchema(spec, node, context, seen = new Set()) {
  if (!node || typeof node !== "object") fail(`${context} must be a schema object`);

  const reference = referencedSchemaName(node);
  if (reference) {
    if (!spec.schemas[reference]) fail(`${context} references missing schema ${reference}`);
    if (seen.has(reference)) return;
    visitSchema(
      spec,
      spec.schemas[reference],
      `${context} -> ${reference}`,
      new Set([...seen, reference]),
    );
    return;
  }

  if (node.catalogRef && !spec.catalogs[node.catalogRef]) {
    fail(`${context} references missing catalog ${node.catalogRef}`);
  }
  if (node.extends) {
    visitSchema(spec, node.extends, `${context}.extends`, seen);
    const base = resolveSchema(spec, node.extends);
    if (base.type !== "object") fail(`${context}.extends must reference an object schema`);
  }
  if (node.type === "object") {
    const properties = node.properties ?? {};
    for (const requiredName of node.required ?? []) {
      if (!(requiredName in properties))
        fail(`${context} requires missing property ${requiredName}`);
    }
    for (const [name, property] of Object.entries(properties)) {
      visitSchema(spec, property, `${context}.${name}`, seen);
    }
  }
  if (node.type === "array") {
    if (!node.items) fail(`${context} is an array without items`);
    visitSchema(spec, node.items, `${context}[]`, seen);
  }
  for (const [index, choice] of (node.oneOf ?? []).entries()) {
    visitSchema(spec, choice, `${context}.oneOf[${index}]`, seen);
  }
}

function resolveCatalogEntries(spec, name, seen = new Set()) {
  const catalog = spec.catalogs[name];
  if (!catalog) fail(`unknown catalog ${name}`);
  if (seen.has(name)) fail(`catalog reference cycle at ${name}`);
  if (catalog.entries) return catalog.entries;
  if (!catalog.entriesRef) fail(`catalog ${name} has neither entries nor entriesRef`);
  return resolveCatalogEntries(spec, catalog.entriesRef, new Set([...seen, name]));
}

function validateSpec(spec) {
  if (spec.schemaVersion !== 1) fail(`unsupported schemaVersion ${spec.schemaVersion}`);
  if (!Array.isArray(spec.endpoints) || !Array.isArray(spec.sections)) {
    fail("sections and endpoints must be arrays");
  }
  if (!spec.document.codeExamples?.groups?.length) {
    fail("document.codeExamples must contain at least one group");
  }
  const codeExampleAnchors = new Set();
  for (const group of spec.document.codeExamples.groups) {
    if (codeExampleAnchors.has(group.anchor)) {
      fail(`duplicate code example anchor ${group.anchor}`);
    }
    codeExampleAnchors.add(group.anchor);
    for (const example of group.examples) {
      for (const locale of ["en", "zh"]) {
        if (localize(example.content, locale).includes("```")) {
          fail(`${group.anchor} ${locale} code example contains a Markdown fence`);
        }
      }
    }
  }
  if (spec.endpoints.length > spec.migration.expectedEndpointCount) {
    fail("migrated endpoint count exceeds expectedEndpointCount");
  }
  const catalogDefinitions = Object.entries(spec.catalogs);
  if (catalogDefinitions.length > spec.migration.expectedCatalogCount) {
    fail("migrated catalog count exceeds expectedCatalogCount");
  }
  if (
    spec.migration.complete &&
    (spec.endpoints.length !== spec.migration.expectedEndpointCount ||
      catalogDefinitions.length !== spec.migration.expectedCatalogCount)
  ) {
    fail("migration.complete requires every expected endpoint and catalog to be present");
  }

  const endpointIds = new Set();
  const browserOperations = new Set();
  for (const endpoint of spec.endpoints) {
    if (endpointIds.has(endpoint.id)) fail(`duplicate endpoint id ${endpoint.id}`);
    endpointIds.add(endpoint.id);
    if (!endpoint.http?.path?.startsWith("/")) fail(`${endpoint.id} has an invalid HTTP path`);
    if (!endpoint.response?.schema) fail(`${endpoint.id} has no response schema`);
    visitSchema(spec, endpoint.response.schema, `${endpoint.id}.response`);
    if (endpoint.request) visitSchema(spec, endpoint.request.schema, `${endpoint.id}.request`);
    if (endpoint.deprecated && !endpoint.deprecationNotice) {
      fail(`${endpoint.id} is deprecated without a deprecationNotice`);
    }
    if (!endpoint.deprecated && endpoint.deprecationNotice) {
      fail(`${endpoint.id} has a deprecationNotice but is not deprecated`);
    }
    const browserOperation = endpoint.clients.browser;
    if (!browserOperation) continue;
    for (const parameter of browserOperation.parameters) {
      visitSchema(spec, parameter.schema, `${endpoint.id}.browser.${parameter.name}`);
    }
    const operationKey = `${browserOperation.target}.${browserOperation.method}`;
    if (browserOperations.has(operationKey)) fail(`duplicate browser operation ${operationKey}`);
    browserOperations.add(operationKey);
    const parameterNames = new Set(browserOperation.parameters.map((parameter) => parameter.name));
    const { implementation } = browserOperation;
    if (implementation.kind === "forEachRawDelegate") {
      if (!implementation.iteration) fail(`${endpoint.id} forEachRawDelegate requires iteration`);
      if (!parameterNames.has(implementation.iteration.parameter)) {
        fail(`${endpoint.id} iterates unknown SDK parameter ${implementation.iteration.parameter}`);
      }
      if (!["data", "void"].includes(implementation.result)) {
        fail(`${endpoint.id} forEachRawDelegate only supports data or void results`);
      }
    } else if (implementation.iteration) {
      fail(`${endpoint.id} rawDelegate cannot define iteration`);
    }
    for (const argument of implementation.arguments) {
      if (argument.kind !== "mappedObject" && !argument.parameter) {
        fail(`${endpoint.id} ${argument.kind} argument requires parameter`);
      }
      if (argument.parameter && !parameterNames.has(argument.parameter)) {
        fail(`${endpoint.id} maps unknown SDK parameter ${argument.parameter}`);
      }
      if (argument.kind === "spreadObject" && !argument.fields?.length) {
        fail(`${endpoint.id} spreadObject argument requires fields`);
      }
      for (const field of argument.fields ?? []) {
        if (!parameterNames.has(field)) {
          fail(`${endpoint.id} maps unknown SDK field parameter ${field}`);
        }
      }
      if (argument.kind === "mappedObject" && !argument.mappings?.length) {
        fail(`${endpoint.id} mappedObject argument requires mappings`);
      }
      if (
        argument.omitUndefined &&
        !["parameterObject", "spreadObject", "mappedObject"].includes(argument.kind)
      ) {
        fail(`${endpoint.id} ${argument.kind} argument cannot omit undefined fields`);
      }
      for (const mapping of argument.mappings ?? []) {
        if (mapping.iterationItem && implementation.kind !== "forEachRawDelegate") {
          fail(`${endpoint.id} maps an iteration item without forEachRawDelegate`);
        }
        if (mapping.parameter && !parameterNames.has(mapping.parameter)) {
          fail(`${endpoint.id} maps unknown SDK mapping parameter ${mapping.parameter}`);
        }
        if (mapping.property && !mapping.parameter) {
          fail(`${endpoint.id} maps property ${mapping.property} without a parameter`);
        }
      }
    }
    if (implementation.result === "firstRow") {
      if (!implementation.notFound) fail(`${endpoint.id} firstRow result requires notFound`);
      if (!parameterNames.has(implementation.notFound.parameter)) {
        fail(`${endpoint.id} maps unknown notFound parameter ${implementation.notFound.parameter}`);
      }
    }
    if (implementation.result === "followUp" && !implementation.followUp) {
      fail(`${endpoint.id} followUp result requires followUp configuration`);
    }
    if (implementation.result === "dataField" && !implementation.dataField) {
      fail(`${endpoint.id} dataField result requires a dataField`);
    }
    if (implementation.result !== "dataField" && implementation.dataField) {
      fail(`${endpoint.id} defines dataField for ${implementation.result} result`);
    }
    visitSchema(spec, browserOperation.returnType, `${endpoint.id}.browser.returnType`);
  }

  const placedEndpointIds = new Set();
  for (const section of spec.sections) {
    for (const endpointId of section.endpointIds) {
      if (!endpointIds.has(endpointId)) fail(`section ${section.id} references ${endpointId}`);
      if (placedEndpointIds.has(endpointId))
        fail(`endpoint ${endpointId} appears in multiple sections`);
      placedEndpointIds.add(endpointId);
    }
  }
  for (const endpointId of endpointIds) {
    if (!placedEndpointIds.has(endpointId))
      fail(`endpoint ${endpointId} is not assigned to a section`);
  }
  for (const [name, schema] of Object.entries(spec.schemas)) {
    visitSchema(spec, schema, `schemas.${name}`, new Set([name]));
  }
  for (const [name, catalog] of catalogDefinitions) {
    resolveCatalogEntries(spec, name);
    if (catalog.entriesRef) {
      if (catalog.groups?.length) fail(`catalog ${name} cannot group referenced entries`);
      continue;
    }
    const groupIds = new Set();
    for (const group of catalog.groups ?? []) {
      if (groupIds.has(group.id)) fail(`catalog ${name} has duplicate group ${group.id}`);
      groupIds.add(group.id);
    }
    const values = new Set();
    for (const entry of catalog.entries) {
      if (values.has(entry.value) && !catalog.allowDuplicateValues) {
        fail(`catalog ${name} has duplicate value ${entry.value}`);
      }
      values.add(entry.value);
      if (entry.group && !groupIds.has(entry.group)) {
        fail(`catalog ${name} entry ${entry.value} references missing group ${entry.group}`);
      }
      if (groupIds.size > 0 && !entry.group) {
        fail(`catalog ${name} entry ${entry.value} is missing a group`);
      }
    }
    for (const groupId of groupIds) {
      if (!catalog.entries.some((entry) => entry.group === groupId)) {
        fail(`catalog ${name} group ${groupId} has no entries`);
      }
    }
  }
}

function typescriptPropertyName(name) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? name : JSON.stringify(name);
}

function catalogTypeName(name) {
  return `${name[0].toUpperCase()}${name.slice(1)}Value`;
}

function catalogValues(entries) {
  return [...new Set(entries.map(({ value }) => value))];
}

function typescriptType(node) {
  const reference = referencedSchemaName(node);
  if (reference) return reference;
  if (node.oneOf) return node.oneOf.map((choice) => typescriptType(choice)).join(" | ");
  if (node.enum) return node.enum.map((value) => JSON.stringify(value)).join(" | ");
  if (node.catalogRef) return catalogTypeName(node.catalogRef);
  if (node.type === "array") return `Array<${typescriptType(node.items)}>`;
  if (node.type === "object") {
    const required = new Set(node.required ?? []);
    const members = Object.entries(node.properties ?? {}).map(
      ([name, property]) =>
        `${typescriptPropertyName(name)}${required.has(name) ? "" : "?"}: ${typescriptType(property)};`,
    );
    if (node.additionalProperties) {
      const valueType =
        node.additionalProperties === true ? "unknown" : typescriptType(node.additionalProperties);
      members.push(`[key: string]: ${valueType};`);
    }
    const objectType = members.length === 0 ? "Record<string, never>" : `{ ${members.join(" ")} }`;
    return node.extends ? `${typescriptType(node.extends)} & ${objectType}` : objectType;
  }
  return (
    {
      string: "string",
      number: "number",
      integer: "number",
      boolean: "boolean",
      null: "null",
      void: "void",
      unknown: "unknown",
    }[node.type] ?? "unknown"
  );
}

function typescriptComment(description, deprecated = false) {
  if (!description && !deprecated) return [];
  const lines = ["/**"];
  if (description) lines.push(` * ${description.en}`, ` * @remarks ${description.zh}`);
  if (deprecated) lines.push(" * @deprecated Deprecated API surface.");
  return [...lines, " */"];
}

function renderTypeAlias(name, type, unionMembers = []) {
  const declaration = `export type ${name} = ${type};`;
  if (declaration.length <= 100 || unionMembers.length < 2) return [declaration];
  return [
    `export type ${name} =`,
    ...unionMembers.map(
      (member, index) => `  | ${member}${index === unionMembers.length - 1 ? ";" : ""}`,
    ),
  ];
}

function renderTypes(spec) {
  const lines = ["// Generated by scripts/generate-api-artifacts.mjs. Do not edit.", ""];
  for (const [name, schema] of Object.entries(spec.schemas)) {
    lines.push(...typescriptComment(schema.description, schema.deprecated));
    if (schema.type === "object" && !schema.oneOf && !schema.enum && !schema.catalogRef) {
      const required = new Set(schema.required ?? []);
      const extendedName = schema.extends ? ` extends ${typescriptType(schema.extends)}` : "";
      lines.push(`export interface ${name}${extendedName} {`);
      for (const [propertyName, property] of Object.entries(schema.properties ?? {})) {
        if (property.description) {
          lines.push(`  /** ${property.description.en} / ${property.description.zh} */`);
        }
        lines.push(
          `  ${typescriptPropertyName(propertyName)}${required.has(propertyName) ? "" : "?"}: ${typescriptType(property)};`,
        );
      }
      if (schema.additionalProperties) {
        const valueType =
          schema.additionalProperties === true
            ? "unknown"
            : typescriptType(schema.additionalProperties);
        lines.push(`  [key: string]: ${valueType};`);
      }
      lines.push("}", "");
    } else {
      const unionMembers = schema.enum
        ? schema.enum.map((value) => JSON.stringify(value))
        : schema.catalogRef
          ? resolveCatalogEntries(spec, schema.catalogRef).map(({ value }) => JSON.stringify(value))
          : (schema.oneOf ?? []).map((choice) => typescriptType(choice));
      lines.push(...renderTypeAlias(name, typescriptType(schema), unionMembers), "");
    }
  }
  for (const [name, catalog] of Object.entries(spec.catalogs)) {
    const typeName = catalogTypeName(name);
    if (catalog.entriesRef) {
      lines.push(`export type ${typeName} = ${catalogTypeName(catalog.entriesRef)};`, "");
      continue;
    }
    const unionMembers = catalogValues(resolveCatalogEntries(spec, name)).map((value) =>
      JSON.stringify(value),
    );
    const values = unionMembers.join(" | ") || "never";
    lines.push(...renderTypeAlias(typeName, values, unionMembers), "");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

function renderParameter(parameter) {
  const defaultValue = Object.hasOwn(parameter, "default")
    ? ` = ${JSON.stringify(parameter.default)}`
    : "";
  return `${parameter.name}${parameter.optional && !defaultValue ? "?" : ""}: ${typescriptType(parameter.schema)}${defaultValue}`;
}

function renderMappedField(mapping, iterationItem) {
  let expression = mapping.iterationItem
    ? iterationItem
    : mapping.property
      ? `${mapping.parameter}.${mapping.property}`
      : mapping.parameter;
  if (mapping.transform === "asArray") expression = `asArray(${expression})`;
  if (mapping.transform === "commaSeparated") {
    expression = `Array.isArray(${expression}) ? ${expression}.join(",") : ${expression}`;
  }
  if (Object.hasOwn(mapping, "default")) {
    expression = `${expression} ?? ${JSON.stringify(mapping.default)}`;
  }
  return mapping.name === expression ? mapping.name : `${mapping.name}: ${expression}`;
}

function renderArgument(argument, iterationItem) {
  let expression;
  if (argument.kind === "parameterObject") expression = `{ ${argument.parameter} }`;
  if (argument.kind === "spreadObject") {
    expression = `{ ...${argument.parameter}, ${(argument.fields ?? []).join(", ")} }`;
  }
  if (argument.kind === "mappedObject") {
    const fields = argument.mappings.map((mapping) => renderMappedField(mapping, iterationItem));
    expression = `{ ${fields.join(", ")} }`;
  }
  if (argument.kind === "pagination") expression = `toPageRequest(${argument.parameter})`;
  if (argument.kind === "paginationWithFilters") {
    expression = `toPageRequestWithFilters(${argument.parameter})`;
  }
  expression ??= argument.parameter;
  return argument.omitUndefined ? `removeUndefined(${expression})` : expression;
}

function rawCallExpression(operation, iterationItem) {
  const receiver = ["this.api", ...operation.implementation.call].join(".");
  const argumentsList = operation.implementation.arguments
    .map((argument) => renderArgument(argument, iterationItem))
    .join(", ");
  return `${receiver}(${argumentsList})`;
}

const browserTargets = [
  { id: "root", className: "GeneratedRoxyBrowserClient", apiProperty: "readonly" },
  { id: "workspaces", className: "GeneratedWorkspaceDomain", apiProperty: "protected readonly" },
  { id: "projects", className: "GeneratedProjectDomain", apiProperty: "protected readonly" },
  { id: "profiles", className: "GeneratedProfileDomain", apiProperty: "protected readonly" },
  { id: "proxies", className: "GeneratedProxyDomain", apiProperty: "protected readonly" },
  {
    id: "platformAccounts",
    className: "GeneratedPlatformAccountDomain",
    apiProperty: "protected readonly",
  },
  { id: "labels", className: "GeneratedLabelDomain", apiProperty: "protected readonly" },
];

function renderBrowserOperation(operation) {
  const parameters = operation.parameters.map((parameter) => renderParameter(parameter));
  const returnType = typescriptType(operation.returnType);
  const call = rawCallExpression(operation);
  const isAsync = operation.implementation.result !== "response";
  const signature = `  ${isAsync ? "async " : ""}${operation.method}(${parameters.join(", ")}): Promise<${returnType}> {`;
  const lines = [];
  if (signature.length <= 100) {
    lines.push(signature);
  } else {
    lines.push(`  ${isAsync ? "async " : ""}${operation.method}(`);
    for (const parameter of parameters) lines.push(`    ${parameter},`);
    lines.push(`  ): Promise<${returnType}> {`);
  }
  if (operation.implementation.kind === "forEachRawDelegate") {
    const { item, parameter } = operation.implementation.iteration;
    const [argument] = operation.implementation.arguments;
    if (operation.implementation.arguments.length !== 1 || argument.kind !== "mappedObject") {
      fail(`${operation.method} forEachRawDelegate requires one mappedObject argument`);
    }
    const receiver = ["this.api", ...operation.implementation.call].join(".");
    if (operation.implementation.result === "data") lines.push("    const results = [];");
    lines.push(`    for (const ${item} of asArray(${parameter})) {`);
    if (operation.implementation.result === "void") {
      const statement = `      ensureSuccess(await ${rawCallExpression(operation, item)});`;
      if (statement.length > 100) {
        fail(`${operation.method} forEachRawDelegate void call exceeds the generated line limit`);
      }
      lines.push(statement, "    }", "  }", "");
      return lines;
    }
    lines.push("      results.push(", "        unwrapData(", `          await ${receiver}(`);
    if (argument.omitUndefined) lines.push("            removeUndefined({");
    else lines.push("            {");
    for (const mapping of argument.mappings) {
      lines.push(`              ${renderMappedField(mapping, item)},`);
    }
    if (argument.omitUndefined) lines.push("            }),");
    else lines.push("            },");
    lines.push("          ),", "        ),", "      );");
    lines.push("    }");
    lines.push(`    return Array.isArray(${parameter}) ? results : results[0]!;`);
    lines.push("  }", "");
    return lines;
  }
  if (operation.implementation.result === "response") {
    lines.push(`    return ${call};`);
  } else if (operation.implementation.result === "data") {
    const [argument] = operation.implementation.arguments;
    if (
      operation.implementation.arguments.length === 1 &&
      argument.kind === "mappedObject" &&
      `    return unwrapData(await ${call});`.length > 100
    ) {
      const receiver = ["this.api", ...operation.implementation.call].join(".");
      lines.push("    return unwrapData(", `      await ${receiver}(`);
      if (argument.omitUndefined) lines.push("        removeUndefined({");
      else lines.push("        {");
      for (const mapping of argument.mappings) {
        lines.push(`          ${renderMappedField(mapping)},`);
      }
      if (argument.omitUndefined) lines.push("        }),");
      else lines.push("        },");
      lines.push("      ),", "    );");
    } else {
      lines.push(`    return unwrapData(await ${call});`);
    }
  } else if (operation.implementation.result === "dataField") {
    lines.push(`    const data = unwrapData(await ${call});`);
    lines.push(`    return data.${operation.implementation.dataField};`);
  } else if (operation.implementation.result === "void") {
    const [argument] = operation.implementation.arguments;
    if (
      operation.implementation.arguments.length === 1 &&
      argument.kind === "mappedObject" &&
      `    ensureSuccess(await ${call});`.length > 100
    ) {
      const receiver = ["this.api", ...operation.implementation.call].join(".");
      lines.push("    ensureSuccess(", `      await ${receiver}({`);
      for (const mapping of argument.mappings) {
        lines.push(`        ${renderMappedField(mapping)},`);
      }
      lines.push("      }),", "    );");
    } else {
      lines.push(`    ensureSuccess(await ${call});`);
    }
  } else if (operation.implementation.result === "firstRow") {
    const { message, parameter } = operation.implementation.notFound;
    lines.push(`    const data = unwrapData(await ${call});`);
    lines.push("    const result = data.rows[0];");
    lines.push(`    if (!result) throw new Error(\`${message}: \${${parameter}}\`);`);
    lines.push("    return result;");
  } else if (operation.implementation.result === "followUp") {
    const { method, field } = operation.implementation.followUp;
    lines.push(`    const data = unwrapData(await ${call});`);
    lines.push(`    return this.${method}(data.${field});`);
  } else {
    const paginationArgument = operation.implementation.arguments.find(
      ({ kind }) => kind === "pagination" || kind === "paginationWithFilters",
    );
    if (!paginationArgument) fail(`${operation.method} uses page result without pagination input`);
    lines.push(`    const data = unwrapData(await ${call});`);
    lines.push(`    return toPage(data, ${paginationArgument.parameter});`);
  }
  lines.push("  }", "");
  return lines;
}

function renderBrowserClient(spec) {
  const operations = spec.endpoints.map(({ clients }) => clients.browser).filter(Boolean);
  const typeNames = new Set();
  for (const operation of operations) {
    const returnName = referencedSchemaName(operation.returnType);
    if (returnName) typeNames.add(returnName);
    for (const parameter of operation.parameters) {
      const parameterName = referencedSchemaName(parameter.schema);
      if (parameterName) typeNames.add(parameterName);
    }
  }

  const lines = ["// Generated by scripts/generate-api-artifacts.mjs. Do not edit."];
  if (typeNames.size > 0) {
    const sortedTypeNames = [...typeNames].sort((left, right) => left.localeCompare(right));
    const typeImport = `import type { ${sortedTypeNames.join(", ")} } from "./api-types.js";`;
    if (typeImport.length <= 100) {
      lines.push(typeImport);
    } else {
      lines.push("import type {");
      for (const typeName of sortedTypeNames) lines.push(`  ${typeName},`);
      lines.push('} from "./api-types.js";');
    }
  }
  lines.push('import type { RoxyApiClient } from "../api/roxy-api-client.js";');
  if (
    operations.some(
      (operation) =>
        operation.implementation.kind === "forEachRawDelegate" ||
        operation.implementation.arguments.some((argument) =>
          argument.mappings?.some(({ transform }) => transform === "asArray"),
        ),
    )
  ) {
    lines.push('import { asArray } from "../sdk/shared/ids.js";');
  }
  if (
    operations.some((operation) =>
      operation.implementation.arguments.some(({ omitUndefined }) => omitUndefined),
    )
  ) {
    lines.push('import { removeUndefined } from "../sdk/shared/normalize.js";');
  }
  if (
    operations.some(
      (operation) =>
        operation.implementation.result === "page" ||
        operation.implementation.arguments.some(
          ({ kind }) => kind === "pagination" || kind === "paginationWithFilters",
        ),
    )
  ) {
    const paginationImports = ["toPage", "toPageRequest"];
    if (
      operations.some((operation) =>
        operation.implementation.arguments.some(({ kind }) => kind === "paginationWithFilters"),
      )
    ) {
      paginationImports.push("toPageRequestWithFilters");
    }
    lines.push(`import { ${paginationImports.join(", ")} } from "../sdk/shared/pagination.js";`);
  }
  if (
    operations.some(({ implementation }) =>
      ["data", "dataField", "page", "firstRow"].includes(implementation.result),
    )
  ) {
    lines.push('import { unwrapData } from "../sdk/shared/result.js";');
  }
  if (operations.some(({ implementation }) => implementation.result === "void")) {
    lines.push('import { ensureSuccess } from "../sdk/shared/result.js";');
  }
  lines.push("");

  for (const target of browserTargets) {
    const targetOperations = operations.filter(({ target: id }) => id === target.id);
    if (target.id !== "root" && targetOperations.length === 0) continue;
    lines.push(`export class ${target.className} {`);
    lines.push(`  constructor(${target.apiProperty} api: RoxyApiClient) {}`, "");
    for (const operation of targetOperations) {
      lines.push(...renderBrowserOperation(operation));
    }
    lines.push("}", "");
  }
  return `${lines.join("\n").replace(/\n\n}/g, "\n}").trimEnd()}\n`;
}

function displayType(spec, node) {
  const reference = referencedSchemaName(node);
  if (reference) return displayType(spec, resolveSchema(spec, node));
  if (node.oneOf) return node.oneOf.map((choice) => displayType(spec, choice)).join(" | ");
  if (node.enum)
    return node.enum
      .map((value) => (value === "" ? JSON.stringify(value) : String(value)))
      .join(" | ");
  if (node.catalogRef) return `${node.type ?? "string"} (${node.catalogRef})`;
  if (node.type === "array") return `List<${displayType(spec, node.items)}>`;
  return node.type === "integer" ? "int" : node.type;
}

function tableCell(value) {
  return String(value ?? "-")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("|", "\\|")
    .replaceAll("\n", " ");
}

function displayWidth(value) {
  let width = 0;
  for (const character of value) {
    width +=
      /[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe10-\ufe19\ufe30-\ufe6f\uff00-\uff60\uffe0-\uffe6]/u.test(
        character,
      )
        ? 2
        : 1;
  }
  return width;
}

function padTableCell(value, width) {
  return `${value}${" ".repeat(Math.max(0, width - displayWidth(value)))}`;
}

function schemaRows(spec, node, locale, prefix = "", seen = new Set()) {
  const reference = referencedSchemaName(node);
  if (reference) {
    if (seen.has(reference)) return [];
    return schemaRows(spec, spec.schemas[reference], locale, prefix, new Set([...seen, reference]));
  }
  if (node.oneOf) {
    const variants = node.oneOf.map((choice) => schemaRows(spec, choice, locale, prefix, seen));
    const merged = new Map();
    for (const rows of variants) {
      for (const row of rows) {
        const current = merged.get(row.name);
        if (!current) {
          merged.set(row.name, {
            ...row,
            appearances: 1,
            requiredInEveryAppearance: row.required,
          });
          continue;
        }
        current.appearances += 1;
        current.requiredInEveryAppearance &&= row.required;
        current.requiredWhen ||= row.requiredWhen;
        for (const type of row.type.split(" | ")) {
          if (!current.type.split(" | ").includes(type)) current.type += ` | ${type}`;
        }
        if (current.defaultValue === undefined) current.defaultValue = row.defaultValue;
        if (current.description === "-") current.description = row.description;
      }
    }
    return [...merged.values()].map(({ appearances, requiredInEveryAppearance, ...row }) => ({
      ...row,
      required: appearances === variants.length && requiredInEveryAppearance,
    }));
  }
  if (node.type !== "object") return [];
  const required = new Set(node.required ?? []);
  const rows = [];
  for (const [name, property] of Object.entries(node.properties ?? {})) {
    const path = prefix ? `${prefix}.${name}` : name;
    const resolved = resolveSchema(spec, property);
    rows.push({
      name: path,
      required: required.has(name),
      requiredWhen: localize(property.requiredWhen ?? resolved.requiredWhen, locale),
      type: displayType(spec, property),
      defaultValue: property.default,
      description:
        localize(property.description, locale) ||
        localize(resolveSchema(spec, property).description, locale) ||
        "-",
    });
    if (resolved.type === "object") rows.push(...schemaRows(spec, property, locale, path, seen));
    if (resolved.type === "array") {
      const item = resolveSchema(spec, resolved.items);
      if (item.type === "object")
        rows.push(...schemaRows(spec, resolved.items, locale, `${path}[]`, seen));
    }
  }
  if (node.extends) rows.push(...schemaRows(spec, node.extends, locale, prefix, seen));
  return rows;
}

const labels = {
  en: {
    request: "Request Parameters",
    response: "Response",
    none: "None",
    parameter: "Parameter",
    required: "Required",
    yes: "Yes",
    no: "No",
    type: "Type",
    defaultValue: "Default",
    field: "Field Name",
    fieldType: "Field Type",
    description: "Description",
    appendix: "Appendix",
  },
  zh: {
    request: "请求参数",
    response: "返回结果",
    none: "无",
    parameter: "参数名称",
    required: "必需项",
    yes: "是",
    no: "否",
    type: "参数类型",
    defaultValue: "默认值",
    field: "字段名称",
    fieldType: "字段类型",
    description: "描述",
    appendix: "附录",
  },
};

function renderTable(headers, rows) {
  const cells = [headers, ...rows].map((row) => row.map(tableCell));
  const widths = headers.map((_, columnIndex) =>
    Math.max(3, ...cells.map((row) => displayWidth(row[columnIndex] ?? ""))),
  );
  const renderRow = (row) =>
    `| ${widths.map((width, index) => padTableCell(row[index] ?? "", width)).join(" | ")} |`;
  const output = [renderRow(cells[0]), renderRow(widths.map((width) => "-".repeat(width)))];
  for (const row of cells.slice(1)) output.push(renderRow(row));
  return output.join("\n");
}

function renderEndpoint(spec, endpoint, locale) {
  const text = labels[locale];
  const lines = [
    `### ${localize(endpoint.title, locale)}${endpoint.anchor ? `{#${endpoint.anchor}}` : ""}`,
    "",
    `<b style="font-size: 18px">${endpoint.http.method} ${endpoint.http.path}</b>`,
    "",
  ];
  if (endpoint.deprecated) {
    lines.push("::: warning Deprecated", localize(endpoint.deprecationNotice, locale), ":::", "");
  }
  lines.push(`<p style="font-weight: 600"> <span class="order">1</span> ${text.request}</p>`, "");
  if (endpoint.request === null) {
    lines.push("```Text", text.none, "```");
  } else {
    lines.push(
      "```Json",
      JSON.stringify(localizedExample(endpoint.request.examples, locale), null, 2),
      "```",
      "",
    );
    const rows = schemaRows(spec, endpoint.request.schema, locale).map((row) => [
      row.name,
      row.requiredWhen || (row.required ? text.yes : text.no),
      row.type,
      row.defaultValue ?? "-",
      row.description,
    ]);
    lines.push(
      renderTable(
        [text.parameter, text.required, text.type, text.defaultValue, text.description],
        rows,
      ),
    );
    for (const note of endpoint.request.notes ?? []) {
      lines.push("", `#### ${localize(note.title, locale)}`, "", localize(note.body, locale));
      if (note.image) {
        lines.push("", `![${localize(note.image.alt, locale)}](${note.image.url})`);
      }
    }
  }
  lines.push(
    "",
    `<p style="font-weight: 600"> <span class="order">2</span> ${text.response}</p>`,
    "",
    "```Json",
    JSON.stringify(localizedExample(endpoint.response.examples, locale), null, 2),
    "```",
    "",
  );
  const responseRows = schemaRows(spec, endpoint.response.schema, locale).map((row) => [
    row.name,
    row.type,
    row.description,
  ]);
  lines.push(renderTable([text.field, text.fieldType, text.description], responseRows));
  return lines.join("\n");
}

function renderCatalogEntries(entries, locale) {
  const lines = ["```Text"];
  for (const entry of entries) {
    const label = localize(entry.label, locale);
    lines.push(label ? `${entry.value}    ${label}` : String(entry.value));
  }
  return [...lines, "```"];
}

function renderCatalog(spec, name, catalog, locale) {
  const entries = resolveCatalogEntries(spec, name);
  const lines = [`### ${localize(catalog.title, locale)} {#${catalog.anchor}}`, ""];
  if (catalog.format) lines.push(`#### ${localize(catalog.format, locale)}`, "");
  if (catalog.groups?.length) {
    for (const group of catalog.groups) {
      lines.push(
        `##### ${localize(group.title, locale)}`,
        "",
        ...renderCatalogEntries(
          entries.filter((entry) => entry.group === group.id),
          locale,
        ),
        "",
      );
    }
    return lines.join("\n").trimEnd();
  }
  lines.push(...renderCatalogEntries(entries, locale));
  return lines.join("\n");
}

function renderCodeExamples(section, locale) {
  const lines = [`## ${localize(section.title, locale)}`];
  for (const group of section.groups) {
    lines.push("", `### ${localize(group.title, locale)}{#${group.anchor}}`);
    for (const example of group.examples) {
      lines.push(
        "",
        `#### ${localize(example.title, locale)}`,
        "",
        `\`\`\`${example.language}`,
        localize(example.content, locale),
        "```",
      );
    }
  }
  return lines.join("\n");
}

function renderDocument(spec, locale) {
  const endpointById = new Map(spec.endpoints.map((endpoint) => [endpoint.id, endpoint]));
  const lines = [
    `<!-- Generated by scripts/generate-api-artifacts.mjs. Migrated ${spec.endpoints.length}/${spec.migration.expectedEndpointCount} endpoints and ${Object.keys(spec.catalogs).length}/${spec.migration.expectedCatalogCount} appendices. -->`,
    "",
    `# ${localize(spec.document.title, locale)}`,
    "",
    `::: tip${localize(spec.document.tipLabel, locale) ? ` ${localize(spec.document.tipLabel, locale)}` : ""}`,
    localize(spec.document.notice, locale),
    ":::",
  ];
  for (const section of spec.sections) {
    lines.push("", `## ${localize(section.title, locale)}`);
    for (const endpointId of section.endpointIds) {
      lines.push("", renderEndpoint(spec, endpointById.get(endpointId), locale));
    }
  }
  lines.push("", renderCodeExamples(spec.document.codeExamples, locale));
  const catalogs = Object.entries(spec.catalogs);
  if (catalogs.length > 0) {
    lines.push("", `## ${labels[locale].appendix}`);
    for (const [name, catalog] of catalogs) {
      lines.push("", renderCatalog(spec, name, catalog, locale));
    }
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

async function emit(path, content) {
  if (checkOnly) {
    let current;
    try {
      current = await readFile(path, "utf8");
    } catch {
      throw new Error(`Generated file is missing: ${path}`);
    }
    if (current !== content) throw new Error(`Generated file is stale: ${path}`);
    return;
  }
  await writeFile(path, content, "utf8");
}

export async function generateApiArtifacts() {
  const spec = JSON.parse(await readFile(specPath, "utf8"));
  validateSpec(spec);
  const documentationDirectory = spec.migration.complete ? "docs" : "docs/generated";
  const outputs = new Map([
    [
      resolve(repositoryRoot, documentationDirectory, "api-endpoint.md"),
      renderDocument(spec, "en"),
    ],
    [
      resolve(repositoryRoot, documentationDirectory, "api-endpoint-zh.md"),
      renderDocument(spec, "zh"),
    ],
    [resolve(repositoryRoot, "src/generated/api-types.ts"), renderTypes(spec)],
    [resolve(repositoryRoot, "src/generated/roxy-browser-client.ts"), renderBrowserClient(spec)],
  ]);
  for (const [path, content] of outputs) await emit(path, content);
  return {
    endpointCount: spec.endpoints.length,
    expectedEndpointCount: spec.migration.expectedEndpointCount,
    catalogCount: Object.keys(spec.catalogs).length,
    expectedCatalogCount: spec.migration.expectedCatalogCount,
    outputs: [...outputs.keys()],
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await generateApiArtifacts();
  const action = checkOnly ? "Checked" : "Generated";
  console.log(
    `${action} ${result.outputs.length} API artifacts for ${result.endpointCount}/${result.expectedEndpointCount} endpoints and ${result.catalogCount}/${result.expectedCatalogCount} catalogs.`,
  );
}
