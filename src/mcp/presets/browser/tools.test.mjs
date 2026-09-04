import assert from "node:assert/strict";
import { describe, test } from "vite-plus/test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { ResultSchema } from "@modelcontextprotocol/sdk/types.js";
import {
  BROWSER_MCP_TOOLS,
  createRoxyBrowserMcpServer,
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

async function rawRequest(server, request) {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const response = new Promise((resolve) => {
    clientTransport.onmessage = resolve;
  });
  await server.connect(serverTransport);
  await clientTransport.start();
  await clientTransport.send(request);
  const message = await response;
  await Promise.all([clientTransport.close(), serverTransport.close()]);
  return message;
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

      assert.equal(names.length, 27);
      assert.ok(names.includes("roxy_workspace_list_all"));
      assert.ok(names.includes("roxy_workspace_list"));
      assert.ok(names.includes("roxy_workspace_select"));
      assert.ok(names.includes("roxy_workspace_get_active"));
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
      const noApprovalAnnotations = {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      };
      const deleteApprovalAnnotations = {
        readOnlyHint: false,
        destructiveHint: true,
        openWorldHint: false,
      };
      for (const tool of result.tools) {
        assert.deepEqual(
          tool.annotations,
          tool.name.endsWith("_delete") ? deleteApprovalAnnotations : noApprovalAnnotations,
          `${tool.name} annotations`,
        );
      }
      for (const tool of result.tools) {
        const pageSize = tool.inputSchema?.properties?.pageSize;
        if (pageSize) assert.equal(pageSize.maximum, 100, `${tool.name} pageSize limit`);
      }
      const profileUpdate = result.tools.find((tool) => tool.name === "roxy_profile_update");
      const profileCreate = result.tools.find((tool) => tool.name === "roxy_profile_create");
      const workspaceSelect = result.tools.find((tool) => tool.name === "roxy_workspace_select");
      const workspaceListAll = result.tools.find((tool) => tool.name === "roxy_workspace_list_all");
      const workspaceList = result.tools.find((tool) => tool.name === "roxy_workspace_list");
      const proxyCreate = result.tools.find((tool) => tool.name === "roxy_proxy_create");
      const accountCreate = result.tools.find(
        (tool) => tool.name === "roxy_platform_account_create",
      );
      assert.deepEqual(profileCreate.inputSchema.required, ["profiles"]);
      assert.deepEqual(workspaceSelect.inputSchema.required, ["workspaceId"]);
      assert.equal(workspaceSelect.inputSchema.properties.force.type, "boolean");
      assert.equal(workspaceListAll.inputSchema.type, "object");
      assert.equal(workspaceList._meta["roxybrowser/endpoint"], "GET /workspace/list");
      assert.deepEqual(workspaceList.inputSchema.properties, {});
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
      const {
        coreVersion,
        workspaceId: _updateWorkspaceId,
        ...sharedUpdateProperties
      } = updateProperties;
      const { workspaceId: _createWorkspaceId, ...sharedCreatePropertiesWithoutWorkspace } =
        sharedCreateProperties;
      assert.deepEqual(sharedUpdateProperties, sharedCreatePropertiesWithoutWorkspace);
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
      assert.deepEqual(
        proxyCreate.inputSchema.properties.proxies.items.properties.protocol.enum,
        ["HTTP", "HTTPS", "SOCKS5"],
      );
      assert.deepEqual(proxyCreate.inputSchema.properties.proxies.items.properties.ipType.enum, [
        "IPV4",
        "IPV6",
      ]);
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
      assert.ok(result.tools.some((tool) => tool.name === "roxy_workspace_list_all"));
      const profileList = result.tools.find((tool) => tool.name === "roxy_profile_list");
      assert.equal(profileList.inputSchema.properties.workspaceId, undefined);
    } finally {
      await session.close();
    }
  });

  test("lists workspaces through the unscoped endpoint", async () => {
    const calls = [];
    const restoreFetch = installFetchMock(async (url, options) => {
      const parsedUrl = new URL(url);
      calls.push({ url: parsedUrl, options });
      if (parsedUrl.pathname === "/browser/workspace/active") {
        return createJsonResponse({
          code: 0,
          msg: "ok",
          data: { id: 77, workspaceName: "Current", project_details: [] },
        });
      }
      return createJsonResponse({
        code: 0,
        msg: "ok",
        data: {
          total: 1,
          rows: [
            {
              email: "owner@example.com",
              id: "116613",
              maxWindowCount: 5,
              role: 3,
              totalMemberCount: 100,
              totalWindowCount: 505,
              useMemberCount: 6,
              useWindowCount: 49,
              workspaceName: "All Workspace",
              workspaceNo: "FKO0116613",
            },
          ],
        },
      });
    });
    const server = createRoxyBrowserMcpServer({
      roxy: { apiKey: "current-key", workspaceId: 77 },
    });
    const session = await connect(server);
    try {
      const result = await session.client.callTool({
        name: "roxy_workspace_list",
        arguments: {},
      });
      assert.equal(calls[1].url.pathname, "/workspace/list");
      assert.equal(calls[1].url.search, "");
      assert.equal(calls[1].options.headers.token, "current-key");
      assert.match(getTextContent(result), /FKO0116613/);
      assert.match(getTextContent(result), /6\/100/);
    } finally {
      restoreFetch();
      await session.close();
    }
  });

  test("browser tools do not expose workspaceId request parameters", async () => {
    const server = createRoxyBrowserMcpServer({ roxy: { apiKey: "secret-token" } });
    const session = await connect(server);
    try {
      const result = await session.client.listTools();
      for (const tool of result.tools) {
        if (tool.name !== "roxy_workspace_select") {
          assert.equal(tool.inputSchema.properties?.workspaceId, undefined, tool.name);
        }
      }
    } finally {
      await session.close();
    }
  });

  test("workspace select replaces the MCP client with the returned API key and port", async () => {
    const calls = [];
    const restoreFetch = installFetchMock(async (url, options) => {
      const request = {
        url: new URL(url),
        token: options.headers.token,
        body: options.body ? JSON.parse(options.body) : undefined,
      };
      calls.push(request);
      if (request.url.pathname === "/browser/workspace/select") {
        return createJsonResponse({
          code: 0,
          msg: "ok",
          data: {
            workspace: { id: "target-88", workspaceName: "Target", project_details: [] },
            apiKey: "target-secret-key",
            port: 50001,
            open: true,
            apiRate: 50,
          },
        });
      }
      if (request.url.pathname === "/browser/workspace/active") {
        return createJsonResponse({
          code: 0,
          msg: "ok",
          data: { id: 88, workspaceName: "Target", project_details: [], port: 50001 },
        });
      }
      return createJsonResponse({ code: 0, msg: "ok", data: { total: 0, rows: [] } });
    });
    const server = createRoxyBrowserMcpServer({
      roxy: { apiKey: "current-key", workspaceId: 77 },
    });
    const session = await connect(server);
    try {
      const selected = await session.client.callTool({
        name: "roxy_workspace_select",
        arguments: { workspaceId: 88, force: true },
      });
      assert.equal(calls[1].token, "current-key");
      assert.deepEqual(calls[1].body, { workspaceId: 88, force: true });
      assert.match(getTextContent(selected), /Workspace switched successfully to Target/);
      assert.match(getTextContent(selected), /target-secret-key/);
      assert.match(getTextContent(selected), /127\.0\.0\.1:50001/);
      assert.match(getTextContent(selected), /"open": true/);
      assert.match(getTextContent(selected), /"apiRate": 50/);

      const active = await session.client.callTool({
        name: "roxy_workspace_get_active",
        arguments: {},
      });
      assert.equal(calls[2].token, "target-secret-key");
      assert.equal(calls[2].url.origin, "http://127.0.0.1:50001");
      assert.equal(calls[2].url.searchParams.has("workspaceId"), false);
      assert.match(getTextContent(active), /Target/);
      assert.match(getTextContent(active), /"port": 50001/);
      assert.doesNotMatch(getTextContent(active), /project_details/);

      await session.client.callTool({ name: "roxy_profile_list", arguments: {} });
      assert.equal(calls[3].token, "target-secret-key");
      assert.equal(calls[3].url.origin, "http://127.0.0.1:50001");
      assert.equal(calls[3].url.searchParams.get("workspaceId"), "target-88");
    } finally {
      restoreFetch();
      await session.close();
    }
  });

  test("active workspace is initialized before the first MCP tool call", async () => {
    const calls = [];
    const restoreFetch = installFetchMock(async (url, options) => {
      calls.push({ url: new URL(url), options });
      assert.equal(options.headers.token, "current-key");
      assert.equal(calls.at(-1).url.searchParams.has("workspaceId"), false);
      return createJsonResponse({
        code: 0,
        msg: "ok",
        data: { id: 77, workspaceName: "Current", project_details: [] },
      });
    });
    const server = createRoxyBrowserMcpServer({
      roxy: { apiKey: "current-key", workspaceId: 77 },
    });
    const session = await connect(server);
    try {
      const active = await session.client.callTool({
        name: "roxy_workspace_get_active",
        arguments: {},
      });
      assert.equal(calls.length, 2);
      assert.equal(calls[0].url.pathname, "/browser/workspace/active");
      assert.equal(calls[1].url.pathname, "/browser/workspace/active");
      assert.match(getTextContent(active), /Current/);
    } finally {
      restoreFetch();
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
      const call = await session.client.callTool({
        name: "roxy_profile_list",
        arguments: { page: 1 },
      });
      assert.equal(getTextContent(call), "app 3.0.0");
    } finally {
      await session.close();
    }
  });

  test("browser preset hides workspace control additions before RoxyBrowser 4.0.4", async () => {
    const server = createRoxyBrowserMcpServer({
      roxyBrowserVersion: "4.0.3",
      roxy: { apiKey: "secret-token", workspaceId: 77 },
    });
    const session = await connect(server);
    try {
      const names = (await session.client.listTools()).tools.map((tool) => tool.name);
      assert.equal(names.includes("roxy_workspace_list_all"), false);
      assert.equal(names.includes("roxy_workspace_select"), false);
      assert.equal(names.includes("roxy_workspace_get_active"), false);
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

  test("runtime formats unknown tools and handler errors as text responses", async () => {
    const restoreFetch = installFetchMock(async () =>
      createJsonResponse({ code: 0, msg: "ok", data: { total: 0, rows: [] } }),
    );
    const server = createRoxyBrowserMcpServer({
      roxy: { apiKey: "secret-token", workspaceId: 77 },
    });
    const session = await connect(server);

    try {
      await assert.rejects(
        session.client.callTool({
          name: "roxy_missing_tool",
          arguments: {},
        }),
        /Unknown tool: roxy_missing_tool/,
      );

      const failed = await session.client.callTool({
        name: "roxy_profile_get",
        arguments: { dirId: "missing" },
      });
      assert.equal(failed.isError, true);
      assert.match(getTextContent(failed), /fetch failed|Profile not found|API key/i);
    } finally {
      restoreFetch();
      await session.close();
    }
  });

  test("proxy creation reports complete backend failure as an MCP tool error", async () => {
    const proxyCreate = BROWSER_MCP_TOOLS.find((tool) => tool.name === "roxy_proxy_create");
    assert.ok(proxyCreate);
    const server = new RoxyPresetMcpServer(
      {
        name: "proxy-create-failure-test",
        tools: [proxyCreate],
      },
      {
        browser: {
          proxies: {
            createWithResult: async () => {
              throw new Error("参数错误");
            },
          },
        },
      },
    );
    const session = await connect(server);
    try {
      const failed = await session.client.callTool({
        name: "roxy_proxy_create",
        arguments: {
          checkChannel: "http://ip123.in/ip.json",
          proxies: [{ ipType: "IPV4", host: "127.0.0.1", port: "9" }],
        },
      });
      assert.equal(failed.isError, true);
      assert.match(getTextContent(failed), /1 requested \| 0 succeeded \| 1 failed/);
      assert.match(getTextContent(failed), /参数错误/);
    } finally {
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

  test("runtime validates every published tool contract and exposes server metadata", async () => {
    const server = createRoxyBrowserMcpServer({
      roxy: { apiKey: "secret-token", workspaceId: 77 },
    });
    const session = await connect(server);

    try {
      const result = await session.client.listTools();
      assert.equal(result.resultType, "complete");
      assert.equal(result.tools.length, 27);
      assert.ok(result._meta["io.modelcontextprotocol/serverInfo"]);
      const names = new Set();
      for (const tool of result.tools) {
        assert.match(tool.name, /^[A-Za-z0-9_.-]{1,128}$/);
        assert.ok(tool.description?.trim());
        assert.equal(tool.inputSchema.type, "object");
        assert.ok(!names.has(tool.name));
        names.add(tool.name);
      }

      const modern = await session.client.request(
        {
          method: "server/discover",
          params: {
            _meta: {
              "io.modelcontextprotocol/protocolVersion": "2026-07-28",
              "io.modelcontextprotocol/clientCapabilities": {},
            },
          },
        },
        ResultSchema,
      );
      assert.deepEqual(modern.supportedVersions, ["2026-07-28", "2025-11-25"]);
      assert.deepEqual(modern.capabilities, { tools: {} });
      assert.ok(modern._meta["io.modelcontextprotocol/serverInfo"]);
    } finally {
      await session.close();
    }
  });

  test("runtime reports schema validation failures as tool errors", async () => {
    let called = false;
    const server = new RoxyPresetMcpServer(
      {
        name: "validation-roxy-mcp",
        tools: [
          {
            name: "roxy_requires_id",
            operationId: "custom.requiresId",
            description: "Requires an identifier.",
            inputSchema: {
              type: "object",
              properties: { id: { type: "string" } },
              required: ["id"],
            },
            handler: async () => {
              called = true;
              return "ok";
            },
          },
        ],
      },
      {},
    );
    const session = await connect(server);
    try {
      const result = await session.client.callTool({
        name: "roxy_requires_id",
        arguments: {},
      });
      assert.equal(result.resultType, "complete");
      assert.equal(result.isError, true);
      assert.match(getTextContent(result), /required property 'id'/);
      assert.equal(called, false);
    } finally {
      await session.close();
    }
  });

  test("runtime validates primitive, array, object, enum, and union schema branches", async () => {
    const calls = [];
    const server = new RoxyPresetMcpServer(
      {
        name: "schema-roxy-mcp",
        tools: [
          {
            name: "roxy_schema_probe",
            operationId: "custom.schemaProbe",
            description: "Exercises schema validation.",
            inputSchema: {
              type: "object",
              properties: {
                text: { type: "string", minLength: 2, enum: ["ok"] },
                count: { type: "number" },
                whole: { type: "integer" },
                enabled: { type: "boolean" },
                values: {
                  type: "array",
                  minItems: 1,
                  maxItems: 2,
                  items: { type: "integer" },
                },
                nested: {
                  type: "object",
                  properties: { flag: { type: "boolean" } },
                  additionalProperties: false,
                },
                union: {
                  oneOf: [{ type: "string" }, { type: "object", properties: {} }],
                },
              },
              required: ["text", "count", "whole", "enabled", "values"],
            },
            handler: async (args) => {
              calls.push(args);
              return "ok";
            },
          },
        ],
      },
      {},
    );
    const session = await connect(server);
    try {
      const valid = await session.client.callTool({
        name: "roxy_schema_probe",
        arguments: {
          text: "ok",
          count: 1.5,
          whole: 2,
          enabled: true,
          values: [1],
          nested: { flag: false },
          union: {},
        },
      });
      assert.equal(getTextContent(valid), "ok");

      const invalid = await session.client.callTool({
        name: "roxy_schema_probe",
        arguments: {
          text: "x",
          count: "bad",
          whole: 1.2,
          enabled: "yes",
          values: [1, 2, 3, "bad"],
          nested: { extra: true },
          union: 3,
        },
      });
      assert.equal(invalid.isError, true);
      assert.match(getTextContent(invalid), /text|count|whole|enabled|values|nested|union/);
      assert.equal(calls.length, 1);
    } finally {
      await session.close();
    }
  });

  test("runtime accepts legacy request metadata and rejects malformed modern metadata", async () => {
    const server = createRoxyBrowserMcpServer({
      roxy: { apiKey: "secret-token", workspaceId: 77 },
    });
    const missingMeta = await rawRequest(server, {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
      params: {},
    });
    assert.equal(missingMeta.error.code, -32602);

    const legacyServer = new RoxyPresetMcpServer(
      {
        name: "legacy-roxy-mcp",
        tools: [
          {
            name: "roxy_legacy_probe",
            operationId: "custom.legacyProbe",
            description: "Confirms legacy clients can call tools.",
            inputSchema: { type: "object", properties: {} },
            handler: async () => "ok",
          },
        ],
      },
      {},
    );
    const legacyCall = await rawRequest(legacyServer, {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "roxy_legacy_probe",
        arguments: {},
        _meta: { progressToken: "claude-code-progress" },
      },
    });
    assert.equal(legacyCall.result.content[0].text, "ok");

    const unsupported = createRoxyBrowserMcpServer({
      roxy: { apiKey: "secret-token", workspaceId: 77 },
    });
    const unsupportedResponse = await rawRequest(unsupported, {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {
        _meta: {
          "io.modelcontextprotocol/protocolVersion": "1900-01-01",
          "io.modelcontextprotocol/clientCapabilities": {},
        },
      },
    });
    assert.equal(unsupportedResponse.error.code, -32022);

    const pingServer = createRoxyBrowserMcpServer({
      roxy: { apiKey: "secret-token", workspaceId: 77 },
    });
    const ping = await rawRequest(pingServer, {
      jsonrpc: "2.0",
      id: 3,
      method: "ping",
      params: {
        _meta: {
          "io.modelcontextprotocol/protocolVersion": "2026-07-28",
          "io.modelcontextprotocol/clientCapabilities": {},
        },
      },
    });
    assert.equal(ping.result.resultType, "complete");
    assert.ok(ping.result._meta["io.modelcontextprotocol/serverInfo"]);

    const tool = {
      operationId: "custom.invalid",
      description: "Invalid",
      inputSchema: { type: "object", properties: {} },
      handler: async () => "ok",
    };
    assert.throws(
      () => new RoxyPresetMcpServer({ name: "x", tools: [{ ...tool, name: "bad name" }] }, {}),
      /Invalid MCP tool name/,
    );
    assert.throws(
      () =>
        new RoxyPresetMcpServer(
          {
            name: "x",
            tools: [
              { ...tool, name: "one" },
              { ...tool, name: "one" },
            ],
          },
          {},
        ),
      /Duplicate MCP tool name/,
    );
    assert.throws(
      () =>
        new RoxyPresetMcpServer(
          { name: "x", tools: [{ ...tool, name: "empty", description: " " }] },
          {},
        ),
      /non-empty description/,
    );
    assert.throws(
      () =>
        new RoxyPresetMcpServer(
          { name: "x", tools: [{ ...tool, name: "wrong", inputSchema: { type: "string" } }] },
          {},
        ),
      /object inputSchema/,
    );
  });

  test("browser preset factory supports default options", async () => {
    const browserSession = await connect(createRoxyBrowserMcpServer());

    try {
      const browserTools = await browserSession.client.listTools();
      assert.ok(browserTools.tools.some((tool) => tool.name === "roxy_profile_list"));
    } finally {
      await browserSession.close();
    }
  });
});
