import type { Command } from "commander";
import { RoxyApiClient, type RoxyApiClientOptions } from "../api/index.js";
import { BROWSER_MCP_TOOLS } from "../mcp/presets/browser/index.js";
import { RoxyBrowserClient } from "../sdk/index.js";
import { getRoxyCapability, isRoxyCapabilitySupported, ROXY_OPENAPI_VERSION } from "../version.js";
import {
  addRoxyOptions,
  getRoxyCommandOptionSources,
  getRoxyCommandOptions,
  type RoxyCommandOptions,
} from "./options.js";

export interface CliCommandOptions {
  getRoxyOptions: (
    overrides?: RoxyCommandOptions,
    sources?: Partial<Record<keyof RoxyCommandOptions, string | undefined>>,
  ) => RoxyApiClientOptions;
}

interface ApiCommandOptions {
  injectWorkspace?: boolean;
}

const BLOCKED_OPERATION_SEGMENTS = new Set(["__proto__", "prototype", "constructor"]);

export function addCliCommands(program: Command, options: CliCommandOptions): void {
  program.addHelpCommand(false);

  program
    .command("help [target]")
    .description("Print CLI usage, MCP tool list, or one MCP tool input schema")
    .action((target: string | undefined) => {
      printHelpResult(program, target);
    });

  program
    .command("version")
    .description("Print the @roxybrowser/openapi package version")
    .action(() => {
      printJsonResult({ packageVersion: ROXY_OPENAPI_VERSION });
    });

  program
    .command("supports <operation> <roxyBrowserVersion>")
    .description("Check whether an SDK/MCP operation exists in a RoxyBrowser app version")
    .action((operation: string, roxyBrowserVersion: string) => {
      printJsonResult({
        operationId: operation,
        roxyBrowserVersion,
        supported: isRoxyCapabilitySupported(operation, roxyBrowserVersion),
        capability: getRoxyCapability(operation) ?? null,
      });
    });

  addRoxyOptions(
    program
      .command("call <toolName> [args]")
      .description("Call a browser MCP tool by name and print its text result"),
  ).action(async function (this: Command, toolName: string, args: string | undefined) {
    const command = this;
    const result = await runToolCommand(
      toolName,
      args,
      options.getRoxyOptions(getRoxyCommandOptions(command), getRoxyCommandOptionSources(command)),
    );
    console.log(result);
  });

  addRoxyOptions(
    program
      .command("sdk <operation> [args...]")
      .description("Call an SDK method and print the JSON result"),
  ).action(async function (this: Command, operation: string, args: string[]) {
    const command = this;
    const result = await runSdkCommand(operation, args, {
      roxy: options.getRoxyOptions(
        getRoxyCommandOptions(command),
        getRoxyCommandOptionSources(command),
      ),
    });
    printJsonResult(result);
  });

  addRoxyOptions(
    program
      .command("api <method> <path> [params]")
      .description("Call a raw RoxyBrowser endpoint and print the JSON result")
      .option("--no-workspace", "Do not inject the configured workspaceId into object params"),
  ).action(async function (
    this: Command,
    method: string,
    path: string,
    params: string | undefined,
  ) {
    const command = this;
    const commandOptions = command.opts();
    const result = await runApiCommand(
      method,
      path,
      params,
      options.getRoxyOptions(commandOptions, getRoxyCommandOptionSources(command)),
      {
        injectWorkspace: commandOptions.workspace,
      },
    );
    printJsonResult(result);
  });
}

export async function runSdkCommand(
  operation: string,
  rawArgs: string[],
  options: { roxy: RoxyApiClientOptions },
): Promise<unknown> {
  const client = new RoxyBrowserClient(options.roxy);
  const { target, method } = resolveSdkOperation(client, operation);
  return await method.apply(target, rawArgs.map(parseCliValue));
}

export async function runApiCommand(
  method: string,
  path: string,
  rawParams: string | undefined,
  roxy: RoxyApiClientOptions,
  options: ApiCommandOptions = {},
): Promise<unknown> {
  const normalizedMethod = method.toUpperCase();
  if (normalizedMethod !== "GET" && normalizedMethod !== "POST") {
    throw new Error(`Unsupported HTTP method: ${method}. Use GET or POST.`);
  }
  if (!path.startsWith("/")) {
    throw new Error(`Endpoint path must start with "/": ${path}`);
  }

  const params = injectDefaultWorkspace(parseParams(rawParams), roxy.workspaceId, options);
  const api = new RoxyApiClient(roxy);
  return await api.transport.request({
    method: normalizedMethod,
    path,
    params,
  });
}

export async function runToolCommand(
  toolName: string,
  rawArgs: string | undefined,
  roxy: RoxyApiClientOptions,
): Promise<string> {
  const tool = BROWSER_MCP_TOOLS.find((item) => item.name === toolName);
  if (!tool) {
    throw new Error(`Unknown MCP tool: ${toolName}. Use "help tools" to list tools.`);
  }

  const args =
    (parseObjectParams(rawArgs, "MCP tool args") as Record<string, any> | undefined) ?? {};
  const requestedWorkspaceId =
    typeof args.workspaceId === "number" ? args.workspaceId : roxy.workspaceId;
  const browser = new RoxyBrowserClient({ ...roxy, workspaceId: requestedWorkspaceId });
  return await tool.handler(args, {
    browser,
    workspaceId: requestedWorkspaceId,
  });
}

export function parseCliValue(raw: string): unknown {
  const value = raw.trim();
  if (!value) return raw;

  try {
    return JSON.parse(value);
  } catch {
    return raw;
  }
}

function parseParams(rawParams: string | undefined): object | undefined {
  return parseObjectParams(rawParams, "Raw API params");
}

function parseObjectParams(rawParams: string | undefined, label: string): object | undefined {
  if (rawParams === undefined) return undefined;

  const value = parseCliValue(rawParams);
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be a JSON object.`);
  }
  return value;
}

function injectDefaultWorkspace(
  params: object | undefined,
  workspaceId: number | undefined,
  options: ApiCommandOptions,
): object | undefined {
  if (options.injectWorkspace === false || workspaceId === undefined) return params;

  const normalized = { ...params } as Record<string, unknown>;
  if (normalized.workspaceId === undefined || normalized.workspaceId === null) {
    normalized.workspaceId = workspaceId;
  }
  return normalized;
}

function resolveSdkOperation(
  client: RoxyBrowserClient,
  operation: string,
): { target: unknown; method: (...args: unknown[]) => Promise<unknown> | unknown } {
  const segments = operation.split(".");
  if (segments.some((segment) => !isAllowedOperationSegment(segment))) {
    throw new Error(`Invalid SDK operation path: ${operation}`);
  }

  let target: unknown = client;
  for (const segment of segments.slice(0, -1)) {
    target = readProperty(target, segment, operation);
  }

  const methodName = segments.at(-1);
  if (!methodName) {
    throw new Error(`Invalid SDK operation path: ${operation}`);
  }

  const method = readProperty(target, methodName, operation);
  if (typeof method !== "function") {
    throw new Error(`SDK operation is not callable: ${operation}`);
  }

  return { target, method: method as (...args: unknown[]) => Promise<unknown> | unknown };
}

function readProperty(target: unknown, segment: string, operation: string): unknown {
  if (target === null || target === undefined || !(segment in Object(target))) {
    throw new Error(`Unknown SDK operation: ${operation}`);
  }
  return (target as Record<string, unknown>)[segment];
}

function isAllowedOperationSegment(segment: string): boolean {
  return /^[A-Za-z_$][\w$]*$/.test(segment) && !BLOCKED_OPERATION_SEGMENTS.has(segment);
}

function printJsonResult(result: unknown): void {
  console.log(JSON.stringify(result === undefined ? { ok: true } : result, null, 2));
}

function printHelpResult(program: Command, target: string | undefined): void {
  if (!target) {
    console.log(`${program.helpInformation().trimEnd()}\n\n${helpExamples()}`);
    return;
  }

  if (target === "tools") {
    console.log(formatToolListHelp());
    return;
  }

  const tool = BROWSER_MCP_TOOLS.find((item) => item.name === target);
  if (!tool) {
    throw new Error(`Unknown MCP tool: ${target}. Use "help tools" to list tools.`);
  }

  printJsonResult({
    name: tool.name,
    description: tool.description,
    operationId: tool.operationId,
    endpoint: tool.endpoint,
    inputSchema: tool.inputSchema,
  });
}

function helpExamples(): string {
  return [
    "Help targets:",
    "  help                 Print CLI commands and global options.",
    "  help tools           Print browser MCP tool names, descriptions, operation IDs, endpoints, and required top-level args.",
    "  help <tool-name>     Print one browser MCP tool's full input schema as JSON.",
    "",
    "Tool calls:",
    "  call <tool-name> '<args-json>'",
  ].join("\n");
}

function formatToolListHelp(): string {
  const lines = ["Browser MCP tools:"];
  for (const tool of BROWSER_MCP_TOOLS) {
    const required = getSchemaRequired(tool.inputSchema);
    lines.push(
      [
        `- ${tool.name}`,
        `  description: ${tool.description}`,
        `  operationId: ${tool.operationId}`,
        tool.endpoint ? `  endpoint: ${tool.endpoint}` : undefined,
        `  required: ${required.length > 0 ? required.join(", ") : "-"}`,
        `  schema: help ${tool.name}`,
        `  call: call ${tool.name} '<args-json>'`,
      ]
        .filter((line): line is string => Boolean(line))
        .join("\n"),
    );
  }
  return lines.join("\n");
}

function getSchemaRequired(schema: unknown): string[] {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) return [];
  const required = (schema as Record<string, unknown>).required;
  return Array.isArray(required)
    ? required.filter((item): item is string => typeof item === "string")
    : [];
}
