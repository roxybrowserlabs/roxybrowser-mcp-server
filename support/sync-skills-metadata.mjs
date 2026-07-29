#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const defaultManifestPath = "skills/skills.json";

function printUsage() {
  console.log(`Usage:
  pnpm skills:apply [--manifest skills/skills.json]
  pnpm skills:check [--manifest skills/skills.json]
  pnpm skills:pull <url> [--manifest skills/skills.json] [--no-apply]

The manifest stores editable skill metadata locally. Pull accepts either:
  { "version": 1, "skills": [{ "name": "...", "description": "...", "path": "..." }] }
or a raw array of skill objects.`);
}

function parseArgs(args) {
  const options = {
    manifestPath: defaultManifestPath,
    applyAfterPull: true,
    positionals: [],
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--manifest") {
      index += 1;
      if (!args[index]) throw new Error("--manifest requires a path");
      options.manifestPath = args[index];
      continue;
    }

    if (arg.startsWith("--manifest=")) {
      options.manifestPath = arg.slice("--manifest=".length);
      continue;
    }

    if (arg === "--no-apply") {
      options.applyAfterPull = false;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    options.positionals.push(arg);
  }

  return options;
}

function asNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim() === "")
    throw new Error(`${label} must be a non-empty string`);
  return value.trim();
}

function normalizeSkill(skill, index) {
  if (!skill || typeof skill !== "object" || Array.isArray(skill))
    throw new Error(`skills[${index}] must be an object`);

  const name = asNonEmptyString(skill.name ?? skill.slug ?? skill.id, `skills[${index}].name`);
  const description = asNonEmptyString(
    skill.description ?? skill.desc ?? skill.summary,
    `skills[${index}].description`,
  );
  const path =
    skill.path === undefined
      ? `skills/${name}/SKILL.md`
      : asNonEmptyString(skill.path, `skills[${index}].path`);

  return { name, description, path };
}

function normalizeManifest(input) {
  const rawSkills = Array.isArray(input) ? input : input?.skills;
  if (!Array.isArray(rawSkills))
    throw new Error("manifest must be an object with a skills array, or a skills array");

  return {
    $schema: "./skills.schema.json",
    version: Number.isInteger(input?.version) ? input.version : 1,
    skills: rawSkills.map(normalizeSkill),
  };
}

function yamlScalar(value) {
  if (
    !/[\n\r]/.test(value) &&
    !/^\s|\s$/.test(value) &&
    !/^[-?:,[\]{}#&*!|>'"%@`]/.test(value) &&
    !/:\s| #/.test(value)
  ) {
    return value;
  }

  return JSON.stringify(value);
}

function stripYamlQuotes(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }

  return trimmed;
}

function parseExtraFrontmatterFields(frontmatter) {
  const fields = [];
  for (const line of frontmatter.split("\n")) {
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!match) continue;

    const [, key, value] = match;
    if (key === "name" || key === "description") continue;

    fields.push([key, stripYamlQuotes(value)]);
  }
  return fields;
}

function updateSkillMarkdown(markdown, skill) {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(markdown);
  if (!match) throw new Error(`${skill.path} is missing YAML frontmatter`);

  const extraFields = parseExtraFrontmatterFields(match[1]);
  const frontmatterLines = [
    `name: ${yamlScalar(skill.name)}`,
    `description: ${yamlScalar(skill.description)}`,
    ...extraFields.map(([key, value]) => `${key}: ${yamlScalar(value)}`),
  ];

  const body = markdown.slice(match[0].length).replace(/^\n*/, "");
  return `---\n${frontmatterLines.join("\n")}\n---\n\n${body}`;
}

async function readManifest(manifestPath) {
  const fullPath = resolve(repoRoot, manifestPath);
  const raw = await readFile(fullPath, "utf8");
  return normalizeManifest(JSON.parse(raw));
}

async function applyManifest(manifestPath, { checkOnly = false } = {}) {
  const manifest = await readManifest(manifestPath);
  const changed = [];

  for (const skill of manifest.skills) {
    const fullPath = resolve(repoRoot, skill.path);
    const current = await readFile(fullPath, "utf8");
    const next = updateSkillMarkdown(current, skill);
    if (current === next) continue;

    changed.push(skill.path);
    if (!checkOnly) await writeFile(fullPath, next);
  }

  if (checkOnly && changed.length > 0) {
    throw new Error(`skill metadata is out of sync: ${changed.join(", ")}`);
  }

  const verb = checkOnly ? "checked" : "applied";
  console.log(
    `Skill metadata ${verb}. ${changed.length} file(s) ${checkOnly ? "would change" : "updated"}.`,
  );
}

async function pullManifest(url, manifestPath, { applyAfterPull }) {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`failed to pull skill metadata: ${response.status} ${response.statusText}`);

  const manifest = normalizeManifest(await response.json());
  const fullPath = resolve(repoRoot, manifestPath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Pulled ${manifest.skills.length} skill metadata record(s) into ${manifestPath}.`);

  if (applyAfterPull) await applyManifest(manifestPath);
}

async function main() {
  const [command = "apply", ...rawArgs] = process.argv.slice(2);
  const options = parseArgs(rawArgs);
  if (options.help) {
    printUsage();
    return;
  }

  if (command === "apply") {
    await applyManifest(options.manifestPath);
    return;
  }

  if (command === "check") {
    await applyManifest(options.manifestPath, { checkOnly: true });
    return;
  }

  if (command === "pull") {
    const [url] = options.positionals;
    if (!url) throw new Error("pull requires a metadata JSON URL");
    await pullManifest(url, options.manifestPath, options);
    return;
  }

  printUsage();
  throw new Error(`unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
