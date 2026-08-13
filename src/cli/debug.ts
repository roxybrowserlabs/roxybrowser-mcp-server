import type { Command } from "commander";
import { RoxyApiClient, type RoxyApiClientOptions } from "../api/index.js";
import { RoxyBrowserClient, RoxyCommerceClient } from "../sdk/index.js";

export type DebugCliMode = "browser" | "commerce";

export interface DebugCliOptions {
  mode: DebugCliMode;
  getRoxyOptions: (
    overrides?: RoxyDebugCommandOptions,
    sources?: Partial<Record<keyof RoxyDebugCommandOptions, string | undefined>>,
  ) => RoxyApiClientOptions;
  markHandled: () => void;
}

interface ApiDebugOptions {
  injectWorkspace?: boolean;
}

export interface RoxyDebugCommandOptions {
  apiHost?: string;
  apiKey?: string;
  workspaceId?: number;
  timeout?: number;
}

export function resolveRoxyOptions(
  base: RoxyDebugCommandOptions,
  overrides: RoxyDebugCommandOptions | undefined = {},
  sources?: Partial<Record<keyof RoxyDebugCommandOptions, string | undefined>>,
): RoxyApiClientOptions {
  const merged: RoxyDebugCommandOptions = { ...base };
  for (const key of ["apiHost", "apiKey", "workspaceId", "timeout"] as const) {
    if (sources && sources[key] !== "cli") continue;
    if (overrides[key] !== undefined) {
      merged[key] = overrides[key] as never;
    }
  }

  const workspaceId =
    merged.workspaceId ??
    (process.env.ROXY_WORKSPACE_ID
      ? Number.parseInt(process.env.ROXY_WORKSPACE_ID, 10)
      : undefined);

  return {
    apiHost: merged.apiHost,
    apiKey: merged.apiKey,
    timeout: merged.timeout,
    workspaceId,
  };
}

export function getRoxyCommandOptions(command: Command): RoxyDebugCommandOptions {
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
): Partial<Record<keyof RoxyDebugCommandOptions, string | undefined>> {
  return {
    apiHost: command.getOptionValueSource("apiHost"),
    apiKey: command.getOptionValueSource("apiKey"),
    workspaceId: command.getOptionValueSource("workspaceId"),
    timeout: command.getOptionValueSource("timeout"),
  };
}

const BLOCKED_OPERATION_SEGMENTS = new Set(["__proto__", "prototype", "constructor"]);

export function addDebugCommands(program: Command, options: DebugCliOptions): void {
  addRoxyOptions(
    program
      .command("sdk <operation> [args...]")
      .description("Call a browser or ecommerce SDK method and print the JSON result"),
  ).action(async function (this: Command, operation: string, args: string[]) {
    const command = this;
      options.markHandled();
      const result = await runSdkDebugCommand(operation, args, {
        mode: options.mode,
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
  ).action(async function (this: Command, method: string, path: string, params: string | undefined) {
      const command = this;
      options.markHandled();
      const commandOptions = command.opts();
      const result = await runApiDebugCommand(
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

export function addRoxyOptions<TCommand extends Command>(command: TCommand): TCommand {
  return command
    .option(
      "-H, --api-host <url>",
      "RoxyBrowser API base URL",
      process.env.ROXY_API_HOST ?? "http://127.0.0.1:50000",
    )
    .option("-k, --api-key <key>", "API key", process.env.ROXY_API_KEY ?? "")
    .option("-w, --workspace-id <id>", "Default workspace ID", (value) =>
      Number.parseInt(value, 10),
    )
    .option(
      "-t, --timeout <ms>",
      "Request timeout in milliseconds",
      (value) => Number.parseInt(value, 10),
      process.env.ROXY_TIMEOUT ? Number(process.env.ROXY_TIMEOUT) : 30_000,
    ) as TCommand;
}

export async function runSdkDebugCommand(
  operation: string,
  rawArgs: string[],
  options: { mode: DebugCliMode; roxy: RoxyApiClientOptions },
): Promise<unknown> {
  const client =
    options.mode === "commerce"
      ? new RoxyCommerceClient(options.roxy)
      : new RoxyBrowserClient(options.roxy);
  const { target, method } = resolveSdkOperation(client, operation);
  return await method.apply(target, rawArgs.map(parseCliValue));
}

export async function runApiDebugCommand(
  method: string,
  path: string,
  rawParams: string | undefined,
  roxy: RoxyApiClientOptions,
  options: ApiDebugOptions = {},
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
  if (rawParams === undefined) return undefined;

  const value = parseCliValue(rawParams);
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Raw API params must be a JSON object.");
  }
  return value;
}

function injectDefaultWorkspace(
  params: object | undefined,
  workspaceId: number | undefined,
  options: ApiDebugOptions,
): object | undefined {
  if (options.injectWorkspace === false || workspaceId === undefined) return params;

  const normalized = { ...params } as Record<string, unknown>;
  if (normalized.workspaceId === undefined || normalized.workspaceId === null) {
    normalized.workspaceId = workspaceId;
  }
  return normalized;
}

function resolveSdkOperation(
  client: RoxyBrowserClient | RoxyCommerceClient,
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
