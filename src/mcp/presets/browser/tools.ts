import type { McpTool } from "../../runtime/index.js";
import { removeUndefined } from "../../../sdk/shared/normalize.js";
import {
  formatPlatformAccounts,
  formatProfile,
  formatProfiles,
  normalizeProxyListArgs,
} from "./formatters.js";

const objectSchema = (properties: Record<string, unknown>, required: string[] = []) => ({
  type: "object",
  properties,
  ...(required.length > 0 ? { required } : {}),
});

const singleOrBatchCreateSchema = (
  properties: Record<string, unknown>,
  required: string[],
  batchProperty: string,
) => ({
  type: "object",
  properties: {
    ...properties,
    [batchProperty]: {
      type: "array",
      minItems: 1,
      items: objectSchema(properties, required),
    },
  },
  oneOf: [{ required }, { required: [batchProperty] }],
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
    handler: async (args, context) => {
      const page = await context.browser!.workspaces.list(args);
      return page.rows.length === 0
        ? "No workspaces found."
        : [
            `Found ${page.total} workspace(s).`,
            ...page.rows.map((workspace) => `- ${workspace.id}: ${workspace.name}`),
          ].join("\n");
    },
  },
  {
    name: "roxy_project_list",
    operationId: "browser.project.list",
    endpoint: "GET /project/list",
    description: "List projects in the configured workspace.",
    inputSchema: objectSchema(paginationSchema),
    handler: async (args, context) => {
      const page = await context.browser!.projects.list(args);
      return page.rows.length === 0
        ? "No projects found."
        : [
            `Found ${page.total} project(s).`,
            ...page.rows.map((project) => `- ${project.id}: ${project.name}`),
          ].join("\n");
    },
  },
  {
    name: "roxy_label_list",
    operationId: "browser.label.list",
    endpoint: "GET /browser/label",
    description: "List browser labels.",
    inputSchema: objectSchema({}),
    handler: async (_args, context) => {
      const labels = await context.browser!.labels.list();
      return labels.length === 0
        ? "No labels found."
        : [
            `Found ${labels.length} label(s).`,
            ...labels.map((label) => `- ${label.id}: ${label.name} ${label.color ?? ""}`.trimEnd()),
          ].join("\n");
    },
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
    handler: async (args, context) => formatProfiles(await context.browser!.profiles.list(args)),
  },
  {
    name: "roxy_profile_get",
    operationId: "browser.profile.get",
    endpoint: "GET /browser/detail",
    description: "Get one browser profile.",
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
    handler: async (args, context) => formatProfile(await context.browser!.profiles.create(args)),
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
      await context.browser!.profiles.update(dirId, patch);
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
        removeUndefined({ force: args.force, args: args.args, headless: args.headless }),
      );
      return `Opened profile ${args.dirId}\nCDP WebSocket: ${(opened as any)?.ws ?? "N/A"}`;
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
      await context.browser!.profiles.delete(args.dirIds, removeUndefined({ soft: args.soft }));
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
      const info = await context.browser!.profiles.connectionInfo(args.dirIds);
      return info.length === 0 ? "No connection info found." : JSON.stringify(info, null, 2);
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
    inputSchema: objectSchema({ dirIds: stringArray, type: { type: "string" } }, ["dirIds"]),
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
    handler: async (args, context) => {
      const page = await context.browser!.proxies.list(normalizeProxyListArgs(args));
      return page.rows.length === 0
        ? "No proxies found."
        : [
            `Found ${page.total} proxy/proxies.`,
            ...page.rows.map(
              (proxy) =>
                `- ${proxy.id}: ${proxy.source} ${proxy.protocol ?? "N/A"} ${proxy.host ?? "N/A"}:${proxy.port ?? "N/A"}`,
            ),
          ].join("\n");
    },
  },
  {
    name: "roxy_proxy_get",
    operationId: "browser.proxy.get",
    endpoint: "GET /proxy/detail",
    description: "Get one proxy.",
    inputSchema: objectSchema({ id: { type: "number" } }, ["id"]),
    handler: async (args, context) =>
      JSON.stringify(await context.browser!.proxies.get(args.id), null, 2),
  },
  {
    name: "roxy_proxy_create",
    operationId: "browser.proxy.create",
    endpoint: "POST /proxy/create | POST /proxy/batch_create",
    description: "Create one or more proxies. Use direct fields for one or proxies for a batch.",
    inputSchema: singleOrBatchCreateSchema(
      proxyInputSchema,
      ["protocol", "host", "port"],
      "proxies",
    ),
    handler: async (args, context) => {
      if (Array.isArray(args.proxies)) {
        await context.browser!.proxies.createMany(args.proxies);
        return `Created ${args.proxies.length} proxy/proxies.`;
      }
      await context.browser!.proxies.create(args as any);
      return "Created proxy.";
    },
  },
  {
    name: "roxy_proxy_update",
    operationId: "browser.proxy.update",
    endpoint: "POST /proxy/modify",
    description: "Update a proxy.",
    inputSchema: objectSchema({ id: { type: "number" }, ...proxyInputSchema }, ["id"]),
    handler: async (args, context) => {
      const { id, ...patch } = args;
      await context.browser!.proxies.update(id, patch);
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
    handler: async (args, context) =>
      JSON.stringify(await context.browser!.proxies.detect(args.id), null, 2),
  },
  {
    name: "roxy_proxy_detect_channels",
    operationId: "browser.proxy.detectChannels",
    endpoint: "GET /proxy/detect_channel",
    description: "List proxy detect channels.",
    inputSchema: objectSchema({}),
    handler: async (_args, context) =>
      JSON.stringify(await context.browser!.proxies.detectChannels(), null, 2),
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
        await context.browser!.platformAccounts.createMany(args.accounts);
        return `Created ${args.accounts.length} platform account(s).`;
      }
      const id = await context.browser!.platformAccounts.create(args as any);
      return `Created platform account ${id}.`;
    },
  },
  {
    name: "roxy_platform_account_update",
    operationId: "browser.platformAccount.update",
    endpoint: "POST /account/modify",
    description: "Update a platform account.",
    inputSchema: objectSchema({ id: { type: "number" }, ...platformAccountInputSchema }, ["id"]),
    handler: async (args, context) => {
      const { id, ...patch } = args;
      await context.browser!.platformAccounts.update(id, patch);
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
