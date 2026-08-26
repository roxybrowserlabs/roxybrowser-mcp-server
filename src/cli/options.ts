import type { Command } from "commander";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { RoxyApiClientOptions } from "../api/index.js";

export interface RoxyCommandOptions {
  apiHost?: string;
  apiKey?: string;
  workspaceId?: number;
  timeout?: number;
}

const DEFAULT_API_HOST = "http://127.0.0.1:50000";
const DEFAULT_TIMEOUT = 30_000;

/** Load connection defaults saved by the Roxy Agent/Codex integration. */
export function loadCodexOAuthOptions(
  filePath = process.env.ROXY_CODEX_CONFIG_PATH?.trim() ||
    join(homedir(), ".roxy-agent", "state", "codex-oauth.json"),
): RoxyCommandOptions {
  try {
    const parsed: unknown = JSON.parse(readFileSync(filePath, "utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    const values = parsed as Record<string, unknown>;
    return {
      apiKey: readString(values.apiKey),
      apiHost: readString(values.apiHost),
      workspaceId: readNumber(values.workspaceId),
      timeout: readNumber(values.timeout),
    };
  } catch {
    // Missing or malformed local state should not prevent environment/CLI use.
    return {};
  }
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function readNumber(value: unknown): number | undefined {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim().length > 0
        ? Number(value)
        : NaN;
  return Number.isFinite(parsed) ? parsed : undefined;
}

function loadEnvironmentOptions(): RoxyCommandOptions {
  return {
    apiHost: readString(process.env.ROXY_API_HOST),
    apiKey: readString(process.env.ROXY_API_KEY),
    workspaceId: readNumber(process.env.ROXY_WORKSPACE_ID),
    timeout: readNumber(process.env.ROXY_TIMEOUT),
  };
}

export function resolveRoxyOptions(
  base: RoxyCommandOptions,
  overrides: RoxyCommandOptions | undefined = {},
  sources?: Partial<Record<keyof RoxyCommandOptions, string | undefined>>,
): RoxyApiClientOptions {
  const merged: RoxyCommandOptions = {
    apiHost: DEFAULT_API_HOST,
    timeout: DEFAULT_TIMEOUT,
  };
  mergeDefinedOptions(merged, loadCodexOAuthOptions());
  mergeDefinedOptions(merged, loadEnvironmentOptions());
  mergeDefinedOptions(merged, base);
  for (const key of ["apiHost", "apiKey", "workspaceId", "timeout"] as const) {
    if (sources && sources[key] !== "cli") continue;
    if (overrides[key] !== undefined) merged[key] = overrides[key] as never;
  }

  return {
    apiHost: merged.apiHost,
    apiKey: merged.apiKey,
    timeout: merged.timeout,
    workspaceId: merged.workspaceId,
  };
}

function mergeDefinedOptions(target: RoxyCommandOptions, source: RoxyCommandOptions): void {
  for (const key of ["apiHost", "apiKey", "workspaceId", "timeout"] as const) {
    if (source[key] !== undefined) target[key] = source[key] as never;
  }
}

export function getRoxyCommandOptions(command: Command): RoxyCommandOptions {
  const options = command.opts();
  return {
    apiHost: options.apiHost,
    apiKey: options.apiKey,
    workspaceId: options.workspaceId,
    timeout: options.timeout,
  };
}

export function getRoxyCommandOptionSources(
  command: Command,
): Partial<Record<keyof RoxyCommandOptions, string | undefined>> {
  return {
    apiHost: command.getOptionValueSource("apiHost"),
    apiKey: command.getOptionValueSource("apiKey"),
    workspaceId: command.getOptionValueSource("workspaceId"),
    timeout: command.getOptionValueSource("timeout"),
  };
}

export function addRoxyOptions<TCommand extends Command>(command: TCommand): TCommand {
  return command
    .option("-H, --api-host <url>", "RoxyBrowser API base URL")
    .option("-k, --api-key <key>", "API key")
    .option("-w, --workspace-id <id>", "Default workspace ID", (value) =>
      Number.parseInt(value, 10),
    )
    .option("-t, --timeout <ms>", "Request timeout in milliseconds", (value) =>
      Number.parseInt(value, 10),
    ) as TCommand;
}
