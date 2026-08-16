import type { McpTool } from "../../runtime/index.js";
import { removeUndefined } from "../../../sdk/shared/normalize.js";
import { ROXY_BROWSER_VERSION_4_0_4 } from "../../../version.js";
import { markdownTable } from "../formatting.js";
import {
  formatConnections,
  formatDetectChannels,
  formatLabels,
  formatPlatformAccounts,
  formatProfile,
  formatProfiles,
  formatProjects,
  formatProxies,
  formatProxy,
  formatWorkspaces,
} from "./formatters.js";
import {
  normalizePlatformAccountInput,
  normalizeProfileDeleteOptions,
  normalizeProfileInputWithWarnings,
  normalizeProfileListArgs,
  normalizeProfileOpenOptions,
  normalizeProfileUpdateInputWithWarnings,
  normalizeProxyInput,
  normalizeProxyListArgs,
} from "./inputs.js";

const MAX_CREATE_ITEMS = 30;

const objectSchema = (properties: Record<string, unknown>, required: string[] = []) => ({
  type: "object",
  properties,
  ...(required.length > 0 ? { required } : {}),
});

const arrayCreateSchema = (
  properties: Record<string, unknown>,
  arrayProperty: string,
  itemRequired: string[] = [],
  envelopeProperties: Record<string, unknown> = {},
  envelopeRequired: string[] = [],
) => ({
  type: "object",
  properties: {
    ...envelopeProperties,
    [arrayProperty]: {
      type: "array",
      minItems: 1,
      maxItems: MAX_CREATE_ITEMS,
      items: objectSchema(properties, itemRequired),
    },
  },
  required: [arrayProperty, ...envelopeRequired],
});

const stringArray = { type: "array", items: { type: "string" } };
const numberArray = { type: "array", items: { type: "number" } };
const browserCores = [
  "Chrome Latest",
  "Chrome 150",
  "Chrome 149",
  "Chrome 148",
  "Chrome 147",
  "Chrome 146",
  "Chrome 145",
  "Chrome 144",
  "Chrome 135",
  "Chrome 133",
  "Chrome 130",
  "Chrome 125",
  "Chrome 117",
  "Chrome 109",
  "Firefox Latest",
  "Firefox 146",
];
const browserCoreVersions = [
  "Latest",
  "150",
  "149",
  "148",
  "147",
  "146",
  "145",
  "144",
  "135",
  "133",
  "130",
  "125",
  "117",
  "109",
];
const browserOperatingSystems = [
  "Windows 11",
  "Windows 10",
  "Windows 8",
  "Windows 7",
  "macOS 26",
  "macOS 15",
  "macOS 14",
  "macOS 13",
  "Linux ALL",
  "Android 14",
  "Android 13",
  "Android 12",
  "Android 9",
  "IOS 18",
  "IOS 17",
  "IOS 16",
  "IOS 15",
  "IOS 14",
];

interface CreateItemResult {
  index: number;
  item: string;
  status: "success" | "failed";
  id?: string | number;
  message: string;
  warnings?: string[];
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function assertCreateLimit(items: unknown[], label: string): void {
  if (items.length > MAX_CREATE_ITEMS) {
    throw new Error(
      `Cannot create ${items.length} ${label} in one request. The maximum is ${MAX_CREATE_ITEMS}; no items were created.`,
    );
  }
}

function formatCreateResults(
  label: string,
  results: CreateItemResult[],
  identifierLabel = "ID",
): string {
  const succeeded = results.filter((result) => result.status === "success").length;
  const failed = results.length - succeeded;
  return [
    `${label} creation: ${results.length} requested | ${succeeded} succeeded | ${failed} failed`,
    markdownTable(
      ["#", "Item", "Status", identifierLabel, "Message", "Warnings"],
      results.map((result) => [
        result.index,
        result.item,
        result.status,
        result.id,
        result.message,
        result.warnings?.join("; "),
      ]),
    ),
  ].join("\n");
}

const paginationSchema = {
  page: { type: "number" },
  pageSize: { type: "number", maximum: 100 },
};

const profileCreateSchema = {
  name: { type: "string" },
  projectId: { type: "number" },
  cookie: {
    description:
      "Cookies as JSON, Netscape, Name=Value text, one Cookie object, or an array of Cookie objects.",
    oneOf: [
      { type: "string" },
      {
        type: "object",
        additionalProperties: true,
      },
      {
        type: "array",
        items: {
          type: "object",
          additionalProperties: true,
        },
      },
    ],
  },
  searchEngine: {
    type: "string",
    enum: ["Google", "Microsoft Bing", "Yahoo", "Yandex", "DuckDuckGo"],
  },
  labelIds: numberArray,
  platformAccounts: {
    type: "array",
    description: 'Bind existing platform accounts, for example [{"id": 123}].',
    items: {
      type: "object",
      properties: { id: { type: "number" } },
      additionalProperties: true,
    },
  },
  proxyInfo: {
    type: "object",
    properties: { id: { type: "number" } },
    additionalProperties: true,
    description: 'Bind an existing proxy, for example {"id": 123}.',
  },
  fingerInfo: {
    type: "object",
    additionalProperties: true,
    description: "Browser fingerprint settings.",
  },
  urls: stringArray,
  remark: { type: "string" },
  browserCore: {
    type: "string",
    enum: browserCores,
    description: "Browser core and version, for example Chrome 150 or Firefox Latest.",
  },
  os: {
    type: "string",
    enum: browserOperatingSystems,
    description: "Operating system and version, for example Windows 10.",
  },
};

const { browserCore: _browserCore, ...profileUpdateSchema } = profileCreateSchema;
Object.assign(profileUpdateSchema, {
  coreVersion: {
    type: "string",
    enum: browserCoreVersions,
    description:
      "Version for the profile's existing browser core, or Latest to keep it up to date.",
  },
});

const proxyInputSchema = {
  protocol: { type: "string", default: "SOCKS5" },
  host: { type: "string" },
  port: { type: "string" },
  ipType: { type: "string" },
  checkChannel: { type: "string" },
  username: { type: "string" },
  password: { type: "string" },
  refreshUrl: { type: "string" },
  remark: { type: "string" },
};

const platformAccountInputSchema = {
  platformUrl: { type: "string" },
  username: { type: "string" },
  password: { type: "string" },
  twoFactorKey: { type: "string" },
  remarks: { type: "string" },
};

export const BROWSER_MCP_TOOLS: McpTool[] = [
  {
    name: "roxy_workspace_list",
    operationId: "browser.workspace.list",
    endpoint: "GET /browser/workspace",
    description: "List RoxyBrowser workspaces.",
    inputSchema: objectSchema(paginationSchema),
    handler: async (args, context) =>
      formatWorkspaces(await context.browser!.workspaces.list(args)),
  },
  {
    name: "roxy_project_list",
    operationId: "browser.project.list",
    endpoint: "GET /project/list",
    description: "List projects in the configured workspace.",
    inputSchema: objectSchema(paginationSchema),
    handler: async (args, context) => formatProjects(await context.browser!.projects.list(args)),
  },
  {
    name: "roxy_label_list",
    operationId: "browser.label.list",
    endpoint: "GET /browser/label",
    description: "List browser labels.",
    inputSchema: objectSchema({}),
    handler: async (_args, context) => formatLabels(await context.browser!.labels.list()),
  },
  {
    name: "roxy_profile_list",
    operationId: "browser.profile.list",
    endpoint: "GET /browser/list_v3",
    description: "List browser profiles with their window dirId values.",
    inputSchema: objectSchema({
      ...paginationSchema,
      dirIds: stringArray,
      projectIds: numberArray,
      projectName: { type: "string", sinceRoxyBrowserVersion: ROXY_BROWSER_VERSION_4_0_4 },
      name: { type: "string" },
      serialNumber: {
        type: "string",
        description:
          "Profile serial number, with or without its workspace prefix (for example ROX-11 or 11).",
      },
      os: { type: "string" },
    }),
    handler: async (args, context) =>
      formatProfiles(
        await context.browser!.profiles.list(normalizeProfileListArgs(args)),
        context.roxyBrowserVersion,
      ),
  },
  {
    name: "roxy_profile_get",
    operationId: "browser.profile.get",
    endpoint: "GET /browser/detail",
    description: "Get one browser profile details.",
    inputSchema: objectSchema({ dirId: { type: "string" } }, ["dirId"]),
    handler: async (args, context) =>
      formatProfile(await context.browser!.profiles.get(args.dirId)),
  },
  {
    name: "roxy_profile_create",
    operationId: "browser.profile.create",
    endpoint: "POST /browser/create",
    description: "Create one or more browser profiles.",
    inputSchema: arrayCreateSchema(profileCreateSchema, "profiles"),
    handler: async (args, context) => {
      assertCreateLimit(args.profiles, "browser profiles");
      const results: CreateItemResult[] = [];
      for (const [offset, profile] of args.profiles.entries()) {
        const index = offset + 1;
        const normalized = normalizeProfileInputWithWarnings(profile);
        const originalOsVersion = normalized.input.osVersion;
        const adjustedFirefoxMacOs =
          normalized.input.coreType === "Firefox" &&
          normalized.input.os === "macOS" &&
          originalOsVersion !== undefined &&
          originalOsVersion !== "ALL";
        if (adjustedFirefoxMacOs) normalized.input.osVersion = "ALL";
        try {
          const created = await context.browser!.profiles.createWithResult(normalized.input);
          const message = created.message || "Created successfully.";
          results.push({
            index,
            item: profile.name || `profile ${index}`,
            status: "success",
            id: created.id,
            message: adjustedFirefoxMacOs
              ? `${message} OS was adjusted from macOS ${originalOsVersion} to macOS ALL because Firefox profiles only support macOS ALL.`
              : message,
            warnings: normalized.warnings,
          });
        } catch (error) {
          results.push({
            index,
            item: profile.name || `profile ${index}`,
            status: "failed",
            message: errorMessage(error),
            warnings: normalized.warnings,
          });
        }
      }
      return formatCreateResults("Browser profile", results, "DirId");
    },
  },
  {
    name: "roxy_profile_update",
    operationId: "browser.profile.update",
    endpoint: "POST /browser/mdf",
    description: "Update a browser profile.",
    inputSchema: objectSchema(
      {
        dirId: { type: "string" },
        ...profileUpdateSchema,
      },
      ["dirId"],
    ),
    handler: async (args, context) => {
      const { dirId, ...patch } = args;
      const normalized = normalizeProfileUpdateInputWithWarnings(patch);
      await context.browser!.profiles.update(dirId, normalized.input);
      return [
        `Updated profile ${dirId}.`,
        ...normalized.warnings.map((warning) => `Warning: ${warning}`),
      ].join("\n");
    },
  },
  {
    name: "roxy_profile_open",
    operationId: "browser.profile.open",
    endpoint: "POST /browser/open",
    description: "Open a browser profile.",
    inputSchema: objectSchema(
      {
        dirId: { type: "string" },
        force: { type: "boolean" },
        args: stringArray,
        headless: { type: "boolean" },
      },
      ["dirId"],
    ),
    handler: async (args, context) => {
      const opened = await context.browser!.profiles.open(
        args.dirId,
        normalizeProfileOpenOptions(args),
      );
      return formatConnections(opened ? [{ dirId: args.dirId, ...(opened as any) }] : []);
    },
  },
  {
    name: "roxy_profile_close",
    operationId: "browser.profile.close",
    endpoint: "POST /browser/close",
    description: "Close a browser profile.",
    inputSchema: objectSchema({ dirId: { type: "string" } }, ["dirId"]),
    handler: async (args, context) => {
      await context.browser!.profiles.close(args.dirId);
      return `Closed profile ${args.dirId}.`;
    },
  },
  {
    name: "roxy_profile_delete",
    operationId: "browser.profile.delete",
    endpoint: "POST /browser/delete",
    description: "Delete browser profiles.",
    inputSchema: objectSchema(
      {
        dirIds: stringArray,
        soft: { type: "boolean" },
      },
      ["dirIds"],
    ),
    handler: async (args, context) => {
      await context.browser!.profiles.delete(args.dirIds, normalizeProfileDeleteOptions(args));
      return `Deleted ${args.dirIds.length} profile(s).`;
    },
  },
  {
    name: "roxy_profile_connection_info",
    operationId: "browser.profile.connectionInfo",
    endpoint: "GET /browser/connection_info",
    description: "Get CDP or BiDi connection information for opened browser profiles.",
    inputSchema: objectSchema({ dirIds: stringArray }),
    handler: async (args, context) => {
      return formatConnections(await context.browser!.profiles.connectionInfo(args.dirIds));
    },
  },
  {
    name: "roxy_profile_randomize_fingerprint",
    operationId: "browser.profile.randomizeFingerprint",
    endpoint: "POST /browser/random_env",
    description: "Randomize a browser profile fingerprint.",
    inputSchema: objectSchema({ dirId: { type: "string" } }, ["dirId"]),
    handler: async (args, context) => {
      await context.browser!.profiles.randomizeFingerprint(args.dirId);
      return `Randomized fingerprint for profile ${args.dirId}.`;
    },
  },
  {
    name: "roxy_profile_clear_local_cache",
    operationId: "browser.profile.clearLocalCache",
    endpoint: "POST /browser/clear_local_cache",
    description: "Clear local cache for browser profiles.",
    inputSchema: objectSchema(
      { dirIds: stringArray, type: { type: "string", enum: ["partial", "all", "cloud"] } },
      ["dirIds"],
    ),
    handler: async (args, context) => {
      await context.browser!.profiles.clearLocalCache(
        args.dirIds,
        removeUndefined({ type: args.type }),
      );
      return `Cleared local cache for ${args.dirIds.length} profile(s).`;
    },
  },
  {
    name: "roxy_profile_clear_server_cache",
    operationId: "browser.profile.clearServerCache",
    endpoint: "POST /browser/clear_server_cache",
    description: "Clear server cache for browser profiles.",
    inputSchema: objectSchema({ dirIds: stringArray }, ["dirIds"]),
    handler: async (args, context) => {
      await context.browser!.profiles.clearServerCache(args.dirIds);
      return `Cleared server cache for ${args.dirIds.length} profile(s).`;
    },
  },
  {
    name: "roxy_proxy_list",
    operationId: "browser.proxy.list",
    endpoint: "GET /proxy/list_merged",
    description: "List proxies from user-added and proxy-store sources.",
    inputSchema: objectSchema({
      ...paginationSchema,
      source: { type: "string", enum: ["user", "store", "all"] },
      type: { type: "string", enum: ["available", "all"] },
      bindStatus: { type: "string", enum: ["bound", "unbound", "all"] },
      autoRenew: { type: "boolean" },
      country: { type: "string" },
      sortBy: { type: "string" },
      sortOrder: { type: "string", enum: ["asc", "desc"] },
    }),
    handler: async (args, context) =>
      formatProxies(await context.browser!.proxies.list(normalizeProxyListArgs(args))),
  },
  // {
  //   name: "roxy_proxy_get",
  //   operationId: "browser.proxy.get",
  //   endpoint: "GET /proxy/detail",
  //   description: "Get one proxy.",
  //   inputSchema: objectSchema({ id: { type: "number" } }, ["id"]),
  //   handler: async (args, context) => formatProxy(await context.browser!.proxies.get(args.id)),
  // },
  {
    name: "roxy_proxy_create",
    operationId: "browser.proxy.create",
    endpoint: "POST /proxy/create | POST /proxy/batch_create",
    description: "Create one or more proxies.",
    inputSchema: arrayCreateSchema(
      proxyInputSchema,
      "proxies",
      ["ipType", "host", "port"],
      { checkChannel: { type: "string" } },
      ["checkChannel"],
    ),
    handler: async (args, context) => {
      assertCreateLimit(args.proxies, "proxies");
      const results: CreateItemResult[] = [];
      for (const [offset, proxy] of args.proxies.entries()) {
        const index = offset + 1;
        try {
          const normalized = normalizeProxyInput({
            ...proxy,
            checkChannel: proxy.checkChannel ?? args.checkChannel,
          });
          const created = await context.browser!.proxies.createWithResult(normalized);
          results.push({
            index,
            item: `${proxy.protocol || "proxy"} ${proxy.host || "-"}:${proxy.port || "-"}`,
            status: "success",
            message: created.message || "Created successfully.",
          });
        } catch (error) {
          results.push({
            index,
            item: `${proxy.protocol || "proxy"} ${proxy.host || "-"}:${proxy.port || "-"}`,
            status: "failed",
            message: errorMessage(error),
          });
        }
      }
      return formatCreateResults("Proxy", results);
    },
  },
  {
    name: "roxy_proxy_update",
    operationId: "browser.proxy.update",
    endpoint: "POST /proxy/modify",
    description: "Update a proxy.",
    inputSchema: objectSchema({ id: { type: "number" }, ...proxyInputSchema }, [
      "id",
      "checkChannel",
      "ipType",
      "protocol",
      "host",
      "port",
    ]),
    handler: async (args, context) => {
      const { id, ...input } = args;
      await context.browser!.proxies.update(id, normalizeProxyInput(input));
      return `Updated proxy ${id}.`;
    },
  },
  {
    name: "roxy_proxy_delete",
    operationId: "browser.proxy.delete",
    endpoint: "POST /proxy/delete",
    description: "Delete proxies.",
    inputSchema: objectSchema({ ids: numberArray }, ["ids"]),
    handler: async (args, context) => {
      await context.browser!.proxies.delete(args.ids);
      return `Deleted ${args.ids.length} proxy/proxies.`;
    },
  },
  {
    name: "roxy_proxy_detect",
    operationId: "browser.proxy.detect",
    endpoint: "POST /proxy/detect",
    description: "Detect a proxy.",
    inputSchema: objectSchema({ id: { type: "number" } }, ["id"]),
    handler: async (args, context) => {
      await context.browser!.proxies.detect(args.id);
      return `Detected proxy ${args.id}.`;
    },
  },
  {
    name: "roxy_proxy_detect_channels",
    operationId: "browser.proxy.detectChannels",
    endpoint: "GET /proxy/detect_channel",
    description: "List proxy detect channels.",
    inputSchema: objectSchema({}),
    handler: async (_args, context) =>
      formatDetectChannels(await context.browser!.proxies.detectChannels()),
  },
  {
    name: "roxy_platform_account_list",
    operationId: "browser.platformAccount.list",
    endpoint: "GET /account/list",
    description: "List platform accounts.",
    inputSchema: objectSchema(paginationSchema),
    handler: async (args, context) =>
      formatPlatformAccounts(await context.browser!.platformAccounts.list(args)),
  },
  {
    name: "roxy_platform_account_create",
    operationId: "browser.platformAccount.create",
    endpoint: "POST /account/create | POST /account/batch_create",
    description: "Create one or more platform accounts.",
    inputSchema: arrayCreateSchema(platformAccountInputSchema, "accounts", ["platformUrl"]),
    handler: async (args, context) => {
      assertCreateLimit(args.accounts, "platform accounts");
      const results: CreateItemResult[] = [];
      for (const [offset, account] of args.accounts.entries()) {
        const index = offset + 1;
        try {
          const normalized = normalizePlatformAccountInput(account);
          const created = await context.browser!.platformAccounts.createWithResult(normalized);
          results.push({
            index,
            item: account.username || account.platformUrl || `account ${index}`,
            status: "success",
            id: created.id,
            message: created.message || "Created successfully.",
          });
        } catch (error) {
          results.push({
            index,
            item: account.username || account.platformUrl || `account ${index}`,
            status: "failed",
            message: errorMessage(error),
          });
        }
      }
      return formatCreateResults("Platform account", results);
    },
  },
  {
    name: "roxy_platform_account_update",
    operationId: "browser.platformAccount.update",
    endpoint: "POST /account/modify",
    description: "Update a platform account.",
    inputSchema: objectSchema({ id: { type: "number" }, ...platformAccountInputSchema }, [
      "id",
      "platformUrl",
    ]),
    handler: async (args, context) => {
      const { id, ...patch } = args;
      await context.browser!.platformAccounts.update(id, normalizePlatformAccountInput(patch));
      return `Updated platform account ${id}.`;
    },
  },
  {
    name: "roxy_platform_account_delete",
    operationId: "browser.platformAccount.delete",
    endpoint: "POST /account/delete",
    description: "Delete platform accounts.",
    inputSchema: objectSchema({ ids: numberArray }, ["ids"]),
    handler: async (args, context) => {
      await context.browser!.platformAccounts.delete(args.ids);
      return `Deleted ${args.ids.length} platform account(s).`;
    },
  },
];
