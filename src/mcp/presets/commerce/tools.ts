import type { McpTool } from "../../runtime/index.js";
import { formatPlatformAccounts } from "../browser/formatters.js";
import {
  normalizePlatformAccountInput,
  normalizeProfileDeleteOptions,
  normalizeProfileOpenOptions,
  normalizeProxyInput,
  normalizeProxyListArgs,
} from "../browser/inputs.js";
import { formatCommerceAccount, formatCommerceAccounts } from "./formatters.js";
import { normalizeCommerceAccountInput, normalizeCommerceAccountListArgs } from "./inputs.js";

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
      formatCommerceAccounts(
        await context.commerce!.accounts.list(normalizeCommerceAccountListArgs(args)),
      ),
  },
  {
    name: "roxy_account_get",
    operationId: "commerce.account.get",
    endpoint: "GET /browser/detail",
    description: "Get one ecommerce account.",
    inputSchema: objectSchema({ dirId: { type: "string" } }, ["dirId"]),
    handler: async (args, context) =>
      formatCommerceAccount(await context.commerce!.accounts.get(args.dirId)),
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
      formatCommerceAccount(
        await context.commerce!.accounts.create(normalizeCommerceAccountInput(args)),
      ),
  },
  {
    name: "roxy_account_update",
    operationId: "commerce.account.update",
    endpoint: "POST /browser/mdf",
    description: "Update an ecommerce account.",
    inputSchema: objectSchema(
      {
        dirId: { type: "string" },
        name: { type: "string" },
        projectId: { type: "number" },
        proxyId: { type: "number" },
        urls: stringArray,
      },
      ["dirId"],
    ),
    handler: async (args, context) => {
      const { dirId, ...patch } = args;
      await context.commerce!.accounts.update(dirId, normalizeCommerceAccountInput(patch));
      return `Updated account ${dirId}.`;
    },
  },
  {
    name: "roxy_account_open",
    operationId: "commerce.account.open",
    endpoint: "POST /browser/open",
    description: "Open an ecommerce account session.",
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
      const opened = await context.commerce!.accounts.open(
        args.dirId,
        normalizeProfileOpenOptions(args),
      );
      return `Opened account ${args.dirId}\nCDP WebSocket: ${(opened as any)?.ws ?? "N/A"}`;
    },
  },
  {
    name: "roxy_account_close",
    operationId: "commerce.account.close",
    endpoint: "POST /browser/close",
    description: "Close an ecommerce account session.",
    inputSchema: objectSchema({ dirId: { type: "string" } }, ["dirId"]),
    handler: async (args, context) => {
      await context.commerce!.accounts.close(args.dirId);
      return `Closed account ${args.dirId}.`;
    },
  },
  {
    name: "roxy_account_delete",
    operationId: "commerce.account.delete",
    endpoint: "POST /browser/delete",
    description: "Delete ecommerce accounts.",
    inputSchema: objectSchema({ dirIds: stringArray, soft: { type: "boolean" } }, ["dirIds"]),
    handler: async (args, context) => {
      await context.commerce!.accounts.delete(args.dirIds, normalizeProfileDeleteOptions(args));
      return `Deleted ${args.dirIds.length} ecommerce account(s).`;
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
                `- ${proxy.id}: ${proxy.dataType ?? "N/A"} ${proxy.protocol ?? "N/A"} ${proxy.host ?? "N/A"}:${proxy.port ?? "N/A"}`,
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
    endpoint: "POST /proxy/create | POST /proxy/batch_create",
    description: "Create one or more proxies. Use direct fields for one or proxies for a batch.",
    inputSchema: singleOrBatchCreateSchema(
      proxyInputSchema,
      ["protocol", "host", "port"],
      "proxies",
    ),
    handler: async (args, context) => {
      if (Array.isArray(args.proxies)) {
        await context.commerce!.proxies.createMany(args.proxies.map(normalizeProxyInput));
        return `Created ${args.proxies.length} proxy/proxies.`;
      }
      await context.commerce!.proxies.create(normalizeProxyInput(args));
      return "Created proxy.";
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
      await context.commerce!.proxies.update(id, normalizeProxyInput(patch));
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
    endpoint: "POST /account/create | POST /account/batch_create",
    description:
      "Create one or more platform credentials. Use direct fields for one or credentials for a batch.",
    inputSchema: singleOrBatchCreateSchema(credentialInputSchema, ["platformUrl"], "credentials"),
    handler: async (args, context) => {
      if (Array.isArray(args.credentials)) {
        await context.commerce!.platformCredentials.createMany(
          args.credentials.map(normalizePlatformAccountInput),
        );
        return `Created ${args.credentials.length} platform credential(s).`;
      }
      const id = await context.commerce!.platformCredentials.create(
        normalizePlatformAccountInput(args),
      );
      return `Created platform credential ${id}.`;
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
      await context.commerce!.platformCredentials.update(id, normalizePlatformAccountInput(patch));
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
