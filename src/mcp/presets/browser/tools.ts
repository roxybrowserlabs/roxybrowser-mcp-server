import type { McpTool } from "../../runtime/index.js";
import { removeUndefined } from "../../../sdk/shared/normalize.js";
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
  normalizeProfileInput,
  normalizeProfileListArgs,
  normalizeProfileOpenOptions,
  normalizeProxyInput,
  normalizeProxyListArgs,
} from "./inputs.js";

const objectSchema = (properties: Record<string, unknown>, required: string[] = []) => ({
  type: "object",
  properties,
  ...(required.length > 0 ? { required } : {}),
});

const singleOrBatchCreateSchema = (
  properties: Record<string, unknown>,
  required: string[],
  batchProperty: string,
  batchItemRequired: string[] = required,
  batchEnvelopeRequired: string[] = [],
) => ({
  type: "object",
  properties: {
    ...properties,
    [batchProperty]: {
      type: "array",
      minItems: 1,
      items: objectSchema(properties, batchItemRequired),
    },
  },
  oneOf: [{ required }, { required: [batchProperty, ...batchEnvelopeRequired] }],
});

const stringArray = { type: "array", items: { type: "string" } };
const numberArray = { type: "array", items: { type: "number" } };

const paginationSchema = {
  page: { type: "number" },
  pageSize: { type: "number" },
};

const profilePatchSchema = {
  name: { type: "string" },
  projectId: { type: "number" },
  proxyId: { type: "number" },
  urls: stringArray,
  remark: { type: "string" },
  core: {
    type: "object",
    properties: {
      type: { type: "string" },
      version: { type: "string" },
    },
  },
  os: {
    type: "object",
    properties: {
      name: { type: "string" },
      version: { type: "string" },
    },
  },
};

const proxyInputSchema = {
  protocol: { type: "string" },
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
      name: { type: "string" },
      serialNumber: { type: "string" },
      os: { type: "string" },
    }),
    handler: async (args, context) =>
      formatProfiles(await context.browser!.profiles.list(normalizeProfileListArgs(args))),
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
    description: "Create a browser profile.",
    inputSchema: objectSchema(profilePatchSchema),
    handler: async (args, context) =>
      formatProfile(await context.browser!.profiles.create(normalizeProfileInput(args))),
  },
  {
    name: "roxy_profile_update",
    operationId: "browser.profile.update",
    endpoint: "POST /browser/mdf",
    description: "Update a browser profile.",
    inputSchema: objectSchema(
      {
        dirId: { type: "string" },
        ...profilePatchSchema,
      },
      ["dirId"],
    ),
    handler: async (args, context) => {
      const { dirId, ...patch } = args;
      await context.browser!.profiles.update(dirId, normalizeProfileInput(patch));
      return `Updated profile ${dirId}.`;
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
    description: "Get CDP connection information for opened browser profiles.",
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
      checkStatus: { type: "string", enum: ["passed", "failed", "unknown"] },
      sortBy: { type: "string" },
      sortOrder: { type: "string", enum: ["asc", "desc"] },
    }),
    handler: async (args, context) =>
      formatProxies(await context.browser!.proxies.list(normalizeProxyListArgs(args))),
  },
  {
    name: "roxy_proxy_get",
    operationId: "browser.proxy.get",
    endpoint: "GET /proxy/detail",
    description: "Get one proxy.",
    inputSchema: objectSchema({ id: { type: "number" } }, ["id"]),
    handler: async (args, context) => formatProxy(await context.browser!.proxies.get(args.id)),
  },
  {
    name: "roxy_proxy_create",
    operationId: "browser.proxy.create",
    endpoint: "POST /proxy/create | POST /proxy/batch_create",
    description: "Create one or more proxies. Use direct fields for one or proxies for a batch.",
    inputSchema: singleOrBatchCreateSchema(
      proxyInputSchema,
      ["checkChannel", "ipType", "protocol", "host", "port"],
      "proxies",
      ["ipType", "protocol", "host", "port"],
      ["checkChannel"],
    ),
    handler: async (args, context) => {
      if (Array.isArray(args.proxies)) {
        await context.browser!.proxies.createMany({
          checkChannel: args.checkChannel,
          proxyList: args.proxies.map(normalizeProxyInput),
        });
        return `Created ${args.proxies.length} proxy/proxies.`;
      }
      await context.browser!.proxies.create(normalizeProxyInput(args));
      return "Created proxy.";
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
    description:
      "Create one or more platform accounts. Use direct fields for one or accounts for a batch.",
    inputSchema: singleOrBatchCreateSchema(platformAccountInputSchema, ["platformUrl"], "accounts"),
    handler: async (args, context) => {
      if (Array.isArray(args.accounts)) {
        await context.browser!.platformAccounts.createMany(
          args.accounts.map(normalizePlatformAccountInput),
        );
        return `Created ${args.accounts.length} platform account(s).`;
      }
      const id = await context.browser!.platformAccounts.create(
        normalizePlatformAccountInput(args),
      );
      return `Created platform account ${id}.`;
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
