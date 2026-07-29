import type { McpTool } from "../../runtime/index.js";
import { removeUndefined } from "../../../sdk/shared/normalize.js";
import { formatPlatformAccounts, normalizeProxyListArgs } from "../browser/formatters.js";
import { formatCommerceAccount, formatCommerceAccounts } from "./formatters.js";

const objectSchema = (properties: Record<string, unknown>, required: string[] = []) => ({
  type: "object",
  properties,
  ...(required.length > 0 ? { required } : {}),
});

const stringArray = { type: "array", items: { type: "string" } };
const numberArray = { type: "array", items: { type: "number" } };

const paginationSchema = {
  page: { type: "number" },
  pageSize: { type: "number" },
};

const platformSchema = {
  type: "object",
  properties: {
    url: { type: "string" },
    username: { type: "string" },
    password: { type: "string" },
    twoFactorKey: { type: "string" },
    remarks: { type: "string" },
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

const credentialInputSchema = {
  platformUrl: { type: "string" },
  username: { type: "string" },
  password: { type: "string" },
  twoFactorKey: { type: "string" },
  remarks: { type: "string" },
};

export const COMMERCE_MCP_TOOLS: McpTool[] = [
  {
    name: "roxy_account_list",
    operationId: "commerce.account.list",
    endpoint: "GET /browser/list_v3",
    description: "List ecommerce accounts. Under the hood, accounts are RoxyBrowser profiles.",
    inputSchema: objectSchema({
      ...paginationSchema,
      keyword: { type: "string" },
      projectIds: numberArray,
    }),
    handler: async (args, context) =>
      formatCommerceAccounts(await context.commerce!.accounts.list(args)),
  },
  {
    name: "roxy_account_get",
    operationId: "commerce.account.get",
    endpoint: "GET /browser/detail",
    description: "Get one ecommerce account.",
    inputSchema: objectSchema({ id: { type: "string" } }, ["id"]),
    handler: async (args, context) =>
      formatCommerceAccount(await context.commerce!.accounts.get(args.id)),
  },
  {
    name: "roxy_account_create",
    operationId: "commerce.account.create",
    endpoint: "POST /browser/create",
    description: "Create an ecommerce account. Under the hood, this creates a browser profile.",
    inputSchema: objectSchema(
      {
        name: { type: "string" },
        projectId: { type: "number" },
        proxyId: { type: "number" },
        platform: platformSchema,
        urls: stringArray,
      },
      ["name"],
    ),
    handler: async (args, context) =>
      formatCommerceAccount(await context.commerce!.accounts.create(args as any)),
  },
  {
    name: "roxy_account_update",
    operationId: "commerce.account.update",
    endpoint: "POST /browser/mdf",
    description: "Update an ecommerce account.",
    inputSchema: objectSchema(
      {
        id: { type: "string" },
        name: { type: "string" },
        projectId: { type: "number" },
        proxyId: { type: "number" },
        urls: stringArray,
      },
      ["id"],
    ),
    handler: async (args, context) => {
      const { id, ...patch } = args;
      await context.commerce!.accounts.update(id, patch);
      return `Updated account ${id}.`;
    },
  },
  {
    name: "roxy_account_open",
    operationId: "commerce.account.open",
    endpoint: "POST /browser/open",
    description: "Open an ecommerce account session.",
    inputSchema: objectSchema(
      {
        id: { type: "string" },
        force: { type: "boolean" },
        args: stringArray,
        headless: { type: "boolean" },
      },
      ["id"],
    ),
    handler: async (args, context) => {
      const opened = await context.commerce!.accounts.open(
        args.id,
        removeUndefined({ force: args.force, args: args.args, headless: args.headless }),
      );
      return `Opened account ${args.id}\nCDP WebSocket: ${(opened as any)?.ws ?? "N/A"}`;
    },
  },
  {
    name: "roxy_account_close",
    operationId: "commerce.account.close",
    endpoint: "POST /browser/close",
    description: "Close an ecommerce account session.",
    inputSchema: objectSchema({ id: { type: "string" } }, ["id"]),
    handler: async (args, context) => {
      await context.commerce!.accounts.close(args.id);
      return `Closed account ${args.id}.`;
    },
  },
  {
    name: "roxy_account_delete",
    operationId: "commerce.account.delete",
    endpoint: "POST /browser/delete",
    description: "Delete ecommerce accounts.",
    inputSchema: objectSchema({ ids: stringArray, soft: { type: "boolean" } }, ["ids"]),
    handler: async (args, context) => {
      await context.commerce!.accounts.delete(args.ids, removeUndefined({ soft: args.soft }));
      return `Deleted ${args.ids.length} ecommerce account(s).`;
    },
  },
  {
    name: "roxy_proxy_list",
    operationId: "commerce.proxy.list",
    endpoint: "GET /proxy/list_merged",
    description: "List proxies available for ecommerce accounts.",
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
      const page = await context.commerce!.proxies.list(normalizeProxyListArgs(args));
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
    operationId: "commerce.proxy.get",
    endpoint: "GET /proxy/detail",
    description: "Get one proxy.",
    inputSchema: objectSchema({ id: { type: "number" } }, ["id"]),
    handler: async (args, context) =>
      JSON.stringify(await context.commerce!.proxies.get(args.id), null, 2),
  },
  {
    name: "roxy_proxy_create",
    operationId: "commerce.proxy.create",
    endpoint: "POST /proxy/create",
    description: "Create one proxy.",
    inputSchema: objectSchema(proxyInputSchema, ["protocol", "host", "port"]),
    handler: async (args, context) => {
      await context.commerce!.proxies.create(args as any);
      return "Created proxy.";
    },
  },
  {
    name: "roxy_proxy_create_many",
    operationId: "commerce.proxy.createMany",
    endpoint: "POST /proxy/batch_create",
    description: "Create many proxies.",
    inputSchema: objectSchema(
      {
        proxies: {
          type: "array",
          items: objectSchema(proxyInputSchema, ["protocol", "host", "port"]),
        },
      },
      ["proxies"],
    ),
    handler: async (args, context) => {
      await context.commerce!.proxies.createMany(args.proxies);
      return `Created ${args.proxies.length} proxy/proxies.`;
    },
  },
  {
    name: "roxy_proxy_update",
    operationId: "commerce.proxy.update",
    endpoint: "POST /proxy/modify",
    description: "Update a proxy.",
    inputSchema: objectSchema({ id: { type: "number" }, ...proxyInputSchema }, ["id"]),
    handler: async (args, context) => {
      const { id, ...patch } = args;
      await context.commerce!.proxies.update(id, patch);
      return `Updated proxy ${id}.`;
    },
  },
  {
    name: "roxy_proxy_delete",
    operationId: "commerce.proxy.delete",
    endpoint: "POST /proxy/delete",
    description: "Delete proxies.",
    inputSchema: objectSchema({ ids: numberArray }, ["ids"]),
    handler: async (args, context) => {
      await context.commerce!.proxies.delete(args.ids);
      return `Deleted ${args.ids.length} proxy/proxies.`;
    },
  },
  {
    name: "roxy_proxy_detect",
    operationId: "commerce.proxy.detect",
    endpoint: "POST /proxy/detect",
    description: "Detect a proxy.",
    inputSchema: objectSchema({ id: { type: "number" } }, ["id"]),
    handler: async (args, context) =>
      JSON.stringify(await context.commerce!.proxies.detect(args.id), null, 2),
  },
  {
    name: "roxy_proxy_detect_channels",
    operationId: "commerce.proxy.detectChannels",
    endpoint: "GET /proxy/detect_channel",
    description: "List proxy detect channels.",
    inputSchema: objectSchema({}),
    handler: async (_args, context) =>
      JSON.stringify(await context.commerce!.proxies.detectChannels(), null, 2),
  },
  {
    name: "roxy_platform_credential_list",
    operationId: "commerce.platformCredential.list",
    endpoint: "GET /account/list",
    description: "List platform credentials.",
    inputSchema: objectSchema(paginationSchema),
    handler: async (args, context) =>
      formatPlatformAccounts(await context.commerce!.platformCredentials.list(args)),
  },
  {
    name: "roxy_platform_credential_create",
    operationId: "commerce.platformCredential.create",
    endpoint: "POST /account/create",
    description: "Create a platform credential.",
    inputSchema: objectSchema(credentialInputSchema, ["platformUrl"]),
    handler: async (args, context) => {
      const id = await context.commerce!.platformCredentials.create(args as any);
      return `Created platform credential ${id}.`;
    },
  },
  {
    name: "roxy_platform_credential_create_many",
    operationId: "commerce.platformCredential.createMany",
    endpoint: "POST /account/batch_create",
    description: "Create many platform credentials.",
    inputSchema: objectSchema(
      {
        credentials: { type: "array", items: objectSchema(credentialInputSchema, ["platformUrl"]) },
      },
      ["credentials"],
    ),
    handler: async (args, context) => {
      await context.commerce!.platformCredentials.createMany(args.credentials);
      return `Created ${args.credentials.length} platform credential(s).`;
    },
  },
  {
    name: "roxy_platform_credential_update",
    operationId: "commerce.platformCredential.update",
    endpoint: "POST /account/modify",
    description: "Update a platform credential.",
    inputSchema: objectSchema({ id: { type: "number" }, ...credentialInputSchema }, ["id"]),
    handler: async (args, context) => {
      const { id, ...patch } = args;
      await context.commerce!.platformCredentials.update(id, patch);
      return `Updated platform credential ${id}.`;
    },
  },
  {
    name: "roxy_platform_credential_delete",
    operationId: "commerce.platformCredential.delete",
    endpoint: "POST /account/delete",
    description: "Delete platform credentials.",
    inputSchema: objectSchema({ ids: numberArray }, ["ids"]),
    handler: async (args, context) => {
      await context.commerce!.platformCredentials.delete(args.ids);
      return `Deleted ${args.ids.length} platform credential(s).`;
    },
  },
];
