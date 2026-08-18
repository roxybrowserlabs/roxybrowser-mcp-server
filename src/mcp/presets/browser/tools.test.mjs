import assert from "node:assert/strict";
import { describe, test } from "vite-plus/test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import {
  createRoxyBrowserMcpServer,
  createRoxyCommerceMcpServer,
  ROXY_OPENAPI_VERSION,
} from "../../../../lib/index.js";
import { RoxyPresetMcpServer } from "../../../../lib/mcp/runtime/index.js";
import {
  createJsonResponse,
  getTextContent,
  installFetchMock,
} from "../../../../support/helpers.mjs";

async function connect(server) {
  const client = new Client({ name: "mcp-test-client", version: "3.0.0" }, { capabilities: {} });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return {
    client,
    async close() {
      await Promise.all([clientTransport.close(), serverTransport.close()]);
    },
  };
}

describe("3.0 MCP presets", () => {
  test("browser preset exposes profile tools instead of raw endpoint names", async () => {
    const server = createRoxyBrowserMcpServer({
      roxy: { apiKey: "secret-token", workspaceId: 77 },
    });
    const session = await connect(server);
    try {
      const result = await session.client.listTools();
      const names = result.tools.map((tool) => tool.name);

      assert.equal(names.length, 23);
      assert.equal(names.includes("roxy_workspace_list"), false);
      assert.ok(names.includes("roxy_project_list"));
      assert.ok(names.includes("roxy_label_list"));
      assert.ok(names.includes("roxy_profile_list"));
      assert.ok(names.includes("roxy_profile_open"));
      assert.ok(names.includes("roxy_profile_update"));
      assert.ok(names.includes("roxy_profile_connection_info"));
      const profileOpen = result.tools.find((tool) => tool.name === "roxy_profile_open");
      assert.ok(profileOpen);
      assert.equal(profileOpen._meta["roxybrowser/openapiPackageVersion"], ROXY_OPENAPI_VERSION);
      assert.equal(profileOpen._meta["roxybrowser/operationId"], "browser.profile.open");
      assert.equal(profileOpen._meta["roxybrowser/endpoint"], "POST /browser/open");
      assert.equal("roxybrowser/sinceRoxyBrowserVersion" in profileOpen._meta, false);
      assert.deepEqual(
        result.tools.find((tool) => tool.name === "roxy_project_list").annotations,
        { readOnlyHint: true, openWorldHint: true },
      );
      assert.deepEqual(
        result.tools.find((tool) => tool.name === "roxy_profile_create").annotations,
        { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
      );
      assert.deepEqual(
        result.tools.find((tool) => tool.name === "roxy_profile_update").annotations,
        { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
      );
      assert.deepEqual(
        result.tools.find((tool) => tool.name === "roxy_profile_delete").annotations,
        { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
      );
      assert.deepEqual(
        result.tools.find((tool) => tool.name === "roxy_profile_connection_info").annotations,
        { readOnlyHint: true, openWorldHint: true },
      );
      for (const tool of result.tools) {
        const pageSize = tool.inputSchema?.properties?.pageSize;
        if (pageSize) assert.equal(pageSize.maximum, 100, `${tool.name} pageSize limit`);
      }
      const profileUpdate = result.tools.find((tool) => tool.name === "roxy_profile_update");
      const profileCreate = result.tools.find((tool) => tool.name === "roxy_profile_create");
      const proxyCreate = result.tools.find((tool) => tool.name === "roxy_proxy_create");
      const accountCreate = result.tools.find(
        (tool) => tool.name === "roxy_platform_account_create",
      );
      assert.deepEqual(profileCreate.inputSchema.required, ["profiles"]);
      assert.deepEqual(proxyCreate.inputSchema.required, ["proxies", "checkChannel"]);
      assert.deepEqual(proxyCreate.inputSchema.properties.proxies.items.required, [
        "ipType",
        "host",
        "port",
      ]);
      assert.deepEqual(accountCreate.inputSchema.required, ["accounts"]);
      assert.equal(profileCreate.inputSchema.properties.profiles.maxItems, 30);
      assert.equal(proxyCreate.inputSchema.properties.proxies.maxItems, 30);
      assert.equal(accountCreate.inputSchema.properties.accounts.maxItems, 30);
      assert.equal(profileCreate.inputSchema.properties.name, undefined);
      const browserCoreSchema =
        profileCreate.inputSchema.properties.profiles.items.properties.browserCore;
      assert.equal(browserCoreSchema.type, "string");
      assert.deepEqual(browserCoreSchema.enum, [
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
      ]);
      assert.equal(profileCreate.inputSchema.properties.profiles.items.properties.core, undefined);
      const osSchema = profileCreate.inputSchema.properties.profiles.items.properties.os;
      assert.equal(osSchema.type, "string");
      assert.deepEqual(osSchema.enum, [
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
      ]);
      assert.deepEqual(profileUpdate.inputSchema.required, ["dirId"]);
      const createProperties = profileCreate.inputSchema.properties.profiles.items.properties;
      const { dirId: _dirId, ...updateProperties } = profileUpdate.inputSchema.properties;
      const { browserCore: _createBrowserCore, ...sharedCreateProperties } = createProperties;
      const { coreVersion, ...sharedUpdateProperties } = updateProperties;
      assert.deepEqual(sharedUpdateProperties, sharedCreateProperties);
      assert.equal(profileUpdate.inputSchema.properties.core, undefined);
      assert.equal(profileUpdate.inputSchema.properties.os.type, "string");
      assert.deepEqual(profileUpdate.inputSchema.properties.os.enum, osSchema.enum);
      assert.equal(profileUpdate.inputSchema.properties.browserCore, undefined);
      assert.equal(coreVersion.type, "string");
      assert.deepEqual(coreVersion.enum, [
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
      ]);
      assert.deepEqual(createProperties.platformAccounts.items.properties, {
        id: { type: "number" },
      });
      assert.equal(createProperties.platformAccounts.items.additionalProperties, true);
      assert.deepEqual(createProperties.proxyInfo.properties, { id: { type: "number" } });
      assert.equal(createProperties.proxyInfo.additionalProperties, true);
      assert.equal(createProperties.fingerInfo.properties, undefined);
      assert.equal(createProperties.fingerInfo.additionalProperties, true);
      assert.deepEqual(createProperties.searchEngine.enum, [
        "Google",
        "Microsoft Bing",
        "Yahoo",
        "Yandex",
        "DuckDuckGo",
      ]);
      assert.deepEqual(createProperties.labelIds, {
        type: "array",
        items: { type: "number" },
      });
      assert.deepEqual(
        createProperties.cookie.oneOf.map((schema) => schema.type),
        ["string", "object", "array"],
      );
      assert.equal(createProperties.cookie.oneOf[1].additionalProperties, true);
      assert.equal(createProperties.cookie.oneOf[2].items.additionalProperties, true);
      assert.equal(proxyCreate.inputSchema.properties.protocol, undefined);
      assert.equal(
        proxyCreate.inputSchema.properties.proxies.items.properties.protocol.default,
        "SOCKS5",
      );
      assert.equal(accountCreate.inputSchema.properties.platformUrl, undefined);
      const profileGet = result.tools.find((tool) => tool.name === "roxy_profile_get");
      const profileDelete = result.tools.find((tool) => tool.name === "roxy_profile_delete");
      assert.ok(profileGet.inputSchema.properties.dirId);
      assert.equal(profileGet.inputSchema.properties.id, undefined);
      assert.ok(profileDelete.inputSchema.properties.dirIds);
      assert.equal(profileDelete.inputSchema.properties.ids, undefined);
      assert.ok(names.includes("roxy_proxy_create"));
      assert.equal(names.includes("roxy_proxy_create_many"), false);
      assert.ok(names.includes("roxy_proxy_detect_channels"));
      assert.ok(names.includes("roxy_platform_account_delete"));
      assert.equal(names.includes("roxy_platform_account_create_many"), false);
      assert.equal(names.includes("roxy_browser_list"), false);
      assert.equal(names.includes("roxy_list_browsers"), false);
    } finally {
      await session.close();
    }
  });

  test("browser preset keeps workspace listing when no workspace is configured", async () => {
    const server = createRoxyBrowserMcpServer();
    const session = await connect(server);
    try {
      const result = await session.client.listTools();
      assert.ok(result.tools.some((tool) => tool.name === "roxy_workspace_list"));
    } finally {
      await session.close();
    }
  });

  test("browser preset supports request timeout and public tool filters", async () => {
    const server = createRoxyBrowserMcpServer({
      timeout: 12_345,
      roxy: { apiKey: "secret-token", timeout: 99_999, workspaceId: 77 },
      includeTools: ["roxy_profile_list", "roxy_profile_get", "roxy_profile_open"],
      excludeTools: ["roxy_profile_open"],
    });
    assert.equal(server.context.browser.api.transport.timeout, 12_345);

    const session = await connect(server);
    try {
      const result = await session.client.listTools();
      assert.deepEqual(
        result.tools.map((tool) => tool.name),
        ["roxy_profile_list", "roxy_profile_get"],
      );
    } finally {
      await session.close();
    }
  });

  test("browser preset filters explicit custom tool catalogs", async () => {
    const server = createRoxyBrowserMcpServer({
      tools: [
        {
          name: "custom_one",
          operationId: "custom.one",
          description: "One",
          inputSchema: { type: "object", properties: {} },
          handler: async () => "one",
        },
        {
          name: "custom_two",
          operationId: "custom.two",
          description: "Two",
          inputSchema: { type: "object", properties: {} },
          handler: async () => "two",
        },
      ],
      includeTools: ["custom_one", "custom_two"],
      excludeTools: ["custom_two"],
    });
    const session = await connect(server);
    try {
      const result = await session.client.listTools();
      assert.deepEqual(
        result.tools.map((tool) => tool.name),
        ["custom_one"],
      );
    } finally {
      await session.close();
    }
  });

  test("runtime hides future tools and schema fields for older RoxyBrowser app versions", async () => {
    const server = createRoxyBrowserMcpServer({
      roxyBrowserVersion: "3.0.0",
      tools: [
        {
          name: "roxy_profile_list",
          operationId: "browser.profile.list",
          endpoint: "GET /browser/list_v3",
          description: "List profiles.",
          inputSchema: {
            type: "object",
            properties: {
              page: { type: "number" },
              projectName: { type: "string", sinceRoxyBrowserVersion: "4.0.4" },
            },
            required: ["page", "projectName"],
          },
          handler: async (_args, context) => `app ${context.roxyBrowserVersion}`,
        },
        {
          name: "roxy_profile_open_many",
          operationId: "browser.profile.openMany",
          endpoint: "POST /browser/agent/open",
          sinceRoxyBrowserVersion: "4.0.4",
          description: "Open many profiles.",
          inputSchema: { type: "object", properties: {} },
          handler: async () => "opened",
        },
      ],
    });
    const session = await connect(server);
    try {
      const result = await session.client.listTools();
      assert.deepEqual(
        result.tools.map((tool) => tool.name),
        ["roxy_profile_list"],
      );
      assert.deepEqual(result.tools[0].inputSchema.properties, { page: { type: "number" } });
      assert.deepEqual(result.tools[0].inputSchema.required, ["page"]);
      const call = await session.client.callTool({ name: "roxy_profile_list", arguments: {} });
      assert.equal(getTextContent(call), "app 3.0.0");
    } finally {
      await session.close();
    }
  });

  test("runtime exposes future tools and schema fields when RoxyBrowser app version supports them", async () => {
    const server = createRoxyBrowserMcpServer({
      roxyBrowserVersion: "4.0.4",
      tools: [
        {
          name: "roxy_profile_list",
          operationId: "browser.profile.list",
          description: "List profiles.",
          inputSchema: {
            type: "object",
            properties: {
              projectName: { type: "string", sinceRoxyBrowserVersion: "4.0.4" },
            },
          },
          handler: async () => "list",
        },
        {
          name: "roxy_profile_open_many",
          operationId: "browser.profile.openMany",
          sinceRoxyBrowserVersion: "4.0.4",
          description: "Open many profiles.",
          inputSchema: { type: "object", properties: {} },
          handler: async () => "opened",
        },
      ],
    });
    const session = await connect(server);
    try {
      const result = await session.client.listTools();
      assert.deepEqual(
        result.tools.map((tool) => tool.name),
        ["roxy_profile_list", "roxy_profile_open_many"],
      );
      assert.deepEqual(result.tools[0].inputSchema.properties, {
        projectName: { type: "string" },
      });
    } finally {
      await session.close();
    }
  });

  test("commerce preset is an empty product shell by default", async () => {
    const server = createRoxyCommerceMcpServer({
      roxy: { apiKey: "secret-token", workspaceId: 77 },
    });
    const session = await connect(server);

    try {
      const tools = await session.client.listTools();
      assert.deepEqual(tools.tools, []);
    } finally {
      await session.close();
    }
  });

  test("runtime formats unknown tools and handler errors as text responses", async () => {
    const restoreFetch = installFetchMock(async () =>
      createJsonResponse({ code: 0, msg: "ok", data: { total: 0, rows: [] } }),
    );
    const server = createRoxyBrowserMcpServer({
      roxy: { apiKey: "secret-token", workspaceId: 77 },
    });
    const session = await connect(server);

    try {
      const unknown = await session.client.callTool({
        name: "roxy_missing_tool",
        arguments: {},
      });
      assert.match(getTextContent(unknown), /Unknown tool: roxy_missing_tool/);

      const failed = await session.client.callTool({
        name: "roxy_profile_get",
        arguments: { id: "missing" },
      });
      assert.match(getTextContent(failed), /fetch failed|Profile not found|API key/i);
    } finally {
      restoreFetch();
      await session.close();
    }
  });

  test("runtime handles custom tools and non-Error failures", async () => {
    const server = new RoxyPresetMcpServer(
      {
        name: "custom-roxy-mcp",
        tools: [
          {
            name: "roxy_custom_fail",
            operationId: "custom.fail",
            endpoint: "POST /custom/fail",
            description: "Fail with a non-Error value.",
            inputSchema: { type: "object", properties: {} },
            handler: async () => {
              throw "plain failure";
            },
          },
        ],
      },
      {},
    );
    const session = await connect(server);

    try {
      const tools = await session.client.listTools();
      assert.equal(tools.tools[0].description, "Fail with a non-Error value.");
      const result = await session.client.callTool({
        name: "roxy_custom_fail",
        arguments: undefined,
      });
      assert.equal(getTextContent(result), "Unknown error");
    } finally {
      await session.close();
    }
  });

  test("preset factories support default options and custom tool catalogs", async () => {
    const browserSession = await connect(createRoxyBrowserMcpServer());
    const commerceSession = await connect(
      createRoxyCommerceMcpServer({
        context: { workspaceId: 77 },
        tools: [
          {
            name: "roxy_custom_ok",
            operationId: "custom.ok",
            endpoint: "GET /custom/ok",
            description: "Custom ok tool.",
            inputSchema: { type: "object", properties: {} },
            handler: async () => "ok",
          },
        ],
      }),
    );

    try {
      const browserTools = await browserSession.client.listTools();
      const commerceTools = await commerceSession.client.listTools();
      assert.ok(browserTools.tools.some((tool) => tool.name === "roxy_profile_list"));
      assert.deepEqual(
        commerceTools.tools.map((tool) => tool.name),
        ["roxy_custom_ok"],
      );
    } finally {
      await browserSession.close();
      await commerceSession.close();
    }
  });
});
