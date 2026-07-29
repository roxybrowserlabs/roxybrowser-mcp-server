import assert from "node:assert/strict";
import { describe, test } from "vite-plus/test";
import {
  formatPlatformAccounts,
  formatProfile,
  formatProfiles,
} from "../../../lib/mcp/presets/browser/formatters.js";
import {
  formatCommerceAccount,
  formatCommerceAccounts,
} from "../../../lib/mcp/presets/commerce/formatters.js";
import { BROWSER_MCP_TOOLS } from "../../../lib/mcp/presets/browser/tools.js";
import { COMMERCE_MCP_TOOLS } from "../../../lib/mcp/presets/commerce/tools.js";

function toolByName(tools, name) {
  const tool = tools.find((candidate) => candidate.name === name);
  assert.ok(tool, `missing tool ${name}`);
  return tool;
}

describe("MCP tool handlers", () => {
  test("browser preset handlers use SDK operations and stable debug metadata", async () => {
    const calls = [];
    const context = {
      browser: {
        workspaces: {
          list: async (args) => {
            calls.push(["workspaces.list", args]);
            return { total: 1, rows: [{ id: 77, name: "Default workspace" }] };
          },
        },
        projects: {
          list: async (args) => {
            calls.push(["projects.list", args]);
            return { total: 1, rows: [{ id: 3, name: "Project A" }] };
          },
        },
        labels: {
          list: async () => {
            calls.push(["labels.list"]);
            return [{ id: 8, name: "Warm", color: "#ffcc00" }];
          },
        },
        profiles: {
          list: async (args) => {
            calls.push(["profiles.list", args]);
            return {
              total: 1,
              rows: [{ id: "profile-1", name: "Alpha", serialNumber: 11, raw: {} }],
            };
          },
          get: async (id) => {
            calls.push(["profiles.get", id]);
            return { id, name: "Alpha", raw: {} };
          },
          create: async (args) => {
            calls.push(["profiles.create", args]);
            return { id: "created-profile", name: args.name, raw: {} };
          },
          update: async (id, patch) => {
            calls.push(["profiles.update", id, patch]);
          },
          open: async (id, options) => {
            calls.push(["profiles.open", id, options]);
            return { ws: `ws://${id}` };
          },
          close: async (id) => {
            calls.push(["profiles.close", id]);
          },
          delete: async (ids, options) => {
            calls.push(["profiles.delete", ids, options]);
          },
          connectionInfo: async (ids) => {
            calls.push(["profiles.connectionInfo", ids]);
            return [{ id: ids[0], ws: `ws://${ids[0]}` }];
          },
          randomizeFingerprint: async (id) => {
            calls.push(["profiles.randomizeFingerprint", id]);
          },
          clearLocalCache: async (ids, options) => {
            calls.push(["profiles.clearLocalCache", ids, options]);
          },
          clearServerCache: async (ids) => {
            calls.push(["profiles.clearServerCache", ids]);
          },
        },
        proxies: {
          list: async (args) => {
            calls.push(["proxies.list", args]);
            return {
              total: 1,
              rows: [
                { id: 1, source: "user", protocol: "SOCKS5", host: "127.0.0.1", port: "1080" },
              ],
            };
          },
          get: async (id) => {
            calls.push(["proxies.get", id]);
            return { id, protocol: "SOCKS5", host: "127.0.0.1", port: "1080" };
          },
          create: async (args) => {
            calls.push(["proxies.create", args]);
          },
          createMany: async (proxies) => {
            calls.push(["proxies.createMany", proxies]);
          },
          update: async (id, patch) => {
            calls.push(["proxies.update", id, patch]);
          },
          delete: async (ids) => {
            calls.push(["proxies.delete", ids]);
          },
          detect: async (id) => {
            calls.push(["proxies.detect", id]);
            return { id, checkStatus: "passed" };
          },
          detectChannels: async () => {
            calls.push(["proxies.detectChannels"]);
            return [{ value: "http://iprust.io/ip.json", label: "IPRust.io" }];
          },
        },
        platformAccounts: {
          list: async (args) => {
            calls.push(["platformAccounts.list", args]);
            return {
              total: 1,
              rows: [{ id: 5, platformUrl: "https://example.com", username: "seller", raw: {} }],
            };
          },
          create: async (args) => {
            calls.push(["platformAccounts.create", args]);
            return 6;
          },
          createMany: async (accounts) => {
            calls.push(["platformAccounts.createMany", accounts]);
          },
          update: async (id, patch) => {
            calls.push(["platformAccounts.update", id, patch]);
          },
          delete: async (ids) => {
            calls.push(["platformAccounts.delete", ids]);
          },
        },
      },
    };

    assert.equal(
      toolByName(BROWSER_MCP_TOOLS, "roxy_profile_open").operationId,
      "browser.profile.open",
    );
    assert.equal(toolByName(BROWSER_MCP_TOOLS, "roxy_profile_open").endpoint, "POST /browser/open");

    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_workspace_list").handler({ page: 1 }, context),
      /Default workspace/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_project_list").handler({ page: 1 }, context),
      /Project A/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_label_list").handler({}, context),
      /Warm/,
    );
    const profileList = await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_list").handler(
      { page: 1 },
      context,
    );
    assert.match(profileList, /Alpha/);
    assert.match(profileList, /dirId: profile-1/);
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_get").handler({ id: "profile-1" }, context),
      /profile-1/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_create").handler(
        { name: "Created" },
        context,
      ),
      /created-profile/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_update").handler(
        { id: "profile-1", name: "Updated" },
        context,
      ),
      /Updated profile/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_open").handler(
        { id: "profile-1", force: true, args: ["--flag"] },
        context,
      ),
      /ws:\/\/profile-1/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_close").handler(
        { id: "profile-1" },
        context,
      ),
      /Closed profile/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_delete").handler(
        { ids: ["profile-1"], soft: false },
        context,
      ),
      /Deleted 1/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_connection_info").handler(
        { ids: ["profile-1"] },
        context,
      ),
      /ws:\/\/profile-1/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_randomize_fingerprint").handler(
        { id: "profile-1" },
        context,
      ),
      /Randomized fingerprint/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_clear_local_cache").handler(
        { ids: ["profile-1"], type: "cookie" },
        context,
      ),
      /Cleared local cache/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_clear_server_cache").handler(
        { ids: ["profile-1"] },
        context,
      ),
      /Cleared server cache/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_proxy_list").handler({ source: "all" }, context),
      /SOCKS5/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_proxy_get").handler({ id: 1 }, context),
      /SOCKS5/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_proxy_create").handler(
        { protocol: "SOCKS5", host: "127.0.0.1", port: "1080" },
        context,
      ),
      /Created proxy/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_proxy_create").handler(
        { proxies: [{ protocol: "SOCKS5", host: "127.0.0.1", port: "1080" }] },
        context,
      ),
      /Created 1/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_proxy_update").handler(
        { id: 1, remark: "new" },
        context,
      ),
      /Updated proxy/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_proxy_delete").handler({ ids: [1] }, context),
      /Deleted 1/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_proxy_detect").handler({ id: 1 }, context),
      /passed/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_proxy_detect_channels").handler({}, context),
      /IPRust/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_platform_account_list").handler(
        { page: 1 },
        context,
      ),
      /seller/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_platform_account_create").handler(
        { platformUrl: "https://example.com" },
        context,
      ),
      /6/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_platform_account_create").handler(
        { accounts: [{ platformUrl: "https://example.com" }] },
        context,
      ),
      /Created 1/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_platform_account_update").handler(
        { id: 5, username: "seller2" },
        context,
      ),
      /Updated platform account/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_platform_account_delete").handler(
        { ids: [5] },
        context,
      ),
      /Deleted 1/,
    );

    assert.equal(calls.find((call) => call[0] === "proxies.list")[1].source, "all");
    assert.deepEqual(calls.find((call) => call[0] === "profiles.open")[2], {
      force: true,
      args: ["--flag"],
    });
  });

  test("browser proxy list formatter handles empty results", async () => {
    const text = await toolByName(BROWSER_MCP_TOOLS, "roxy_proxy_list").handler(
      {},
      {
        browser: {
          proxies: {
            list: async () => ({ total: 0, rows: [] }),
          },
        },
      },
    );
    assert.equal(text, "No proxies found.");
  });

  test("MCP handlers cover empty states and optional output fallbacks", async () => {
    assert.match(
      formatProfiles({
        total: 1,
        rows: [
          {
            id: "profile-rich",
            name: "Rich Profile",
            core: { type: "Chrome", version: "140" },
            os: { name: "Windows", version: "11" },
            raw: {},
          },
        ],
      }),
      /Chrome 140/,
    );
    assert.match(
      formatProfile({
        id: "profile-rich",
        name: "Rich Profile",
        core: { type: "Chrome", version: "140" },
        os: { name: "Windows", version: "11" },
        raw: {},
      }),
      /Windows 11/,
    );
    assert.match(
      formatCommerceAccount({ id: "account-rich", name: "Store A", projectId: 9, raw: {} }),
      /projectId: 9/,
    );

    const browserContext = {
      browser: {
        workspaces: { list: async () => ({ total: 0, rows: [] }) },
        projects: { list: async () => ({ total: 0, rows: [] }) },
        labels: { list: async () => [] },
        profiles: {
          open: async () => ({}),
          connectionInfo: async () => [],
        },
        proxies: {
          list: async () => ({ total: 1, rows: [{ id: 1 }] }),
        },
      },
    };

    assert.equal(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_workspace_list").handler({}, browserContext),
      "No workspaces found.",
    );
    assert.equal(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_project_list").handler({}, browserContext),
      "No projects found.",
    );
    assert.equal(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_label_list").handler({}, browserContext),
      "No labels found.",
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_open").handler(
        { id: "profile-empty" },
        browserContext,
      ),
      /N\/A/,
    );
    assert.equal(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_connection_info").handler(
        {},
        browserContext,
      ),
      "No connection info found.",
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_proxy_list").handler({}, browserContext),
      /N\/A:N\/A/,
    );

    const commerceContext = {
      commerce: {
        accounts: { open: async () => ({}) },
        proxies: { list: async () => ({ total: 1, rows: [{ id: 1 }] }) },
      },
    };
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_account_open").handler(
        { id: "account-empty" },
        commerceContext,
      ),
      /N\/A/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_proxy_list").handler({}, commerceContext),
      /N\/A:N\/A/,
    );
  });

  test("commerce preset handlers expose account language over browser endpoints", async () => {
    const calls = [];
    const context = {
      commerce: {
        accounts: {
          list: async (args) => {
            calls.push(["accounts.list", args]);
            return {
              total: 1,
              rows: [{ id: "account-1", name: "Amazon Store A", projectId: 3, raw: {} }],
            };
          },
          get: async (id) => {
            calls.push(["accounts.get", id]);
            return { id, name: "Amazon Store A", raw: {} };
          },
          create: async (args) => {
            calls.push(["accounts.create", args]);
            return { id: "created-account", name: args.name, raw: {} };
          },
          update: async (id, patch) => {
            calls.push(["accounts.update", id, patch]);
          },
          open: async (id, options) => {
            calls.push(["accounts.open", id, options]);
            return { ws: `ws://${id}` };
          },
          close: async (id) => {
            calls.push(["accounts.close", id]);
          },
          delete: async (ids, options) => {
            calls.push(["accounts.delete", ids, options]);
          },
        },
        proxies: {
          list: async (args) => {
            calls.push(["commerce.proxies.list", args]);
            return {
              total: 1,
              rows: [
                {
                  id: 1,
                  source: "store",
                  protocol: "HTTP",
                  host: "proxy.example.com",
                  port: "8080",
                },
              ],
            };
          },
          get: async (id) => {
            calls.push(["commerce.proxies.get", id]);
            return { id, protocol: "HTTP", host: "proxy.example.com", port: "8080" };
          },
          create: async (args) => {
            calls.push(["commerce.proxies.create", args]);
          },
          createMany: async (proxies) => {
            calls.push(["commerce.proxies.createMany", proxies]);
          },
          update: async (id, patch) => {
            calls.push(["commerce.proxies.update", id, patch]);
          },
          delete: async (ids) => {
            calls.push(["commerce.proxies.delete", ids]);
          },
          detect: async (id) => {
            calls.push(["commerce.proxies.detect", id]);
            return { id, checkStatus: "passed" };
          },
          detectChannels: async () => {
            calls.push(["commerce.proxies.detectChannels"]);
            return [{ value: "http://iprust.io/ip.json", label: "IPRust.io" }];
          },
        },
        platformCredentials: {
          list: async (args) => {
            calls.push(["platformCredentials.list", args]);
            return {
              total: 1,
              rows: [
                {
                  id: 9,
                  platformUrl: "https://sellercentral.amazon.com",
                  username: "seller",
                  raw: {},
                },
              ],
            };
          },
          create: async (args) => {
            calls.push(["platformCredentials.create", args]);
            return 10;
          },
          createMany: async (credentials) => {
            calls.push(["platformCredentials.createMany", credentials]);
          },
          update: async (id, patch) => {
            calls.push(["platformCredentials.update", id, patch]);
          },
          delete: async (ids) => {
            calls.push(["platformCredentials.delete", ids]);
          },
        },
      },
    };

    assert.equal(
      toolByName(COMMERCE_MCP_TOOLS, "roxy_account_open").operationId,
      "commerce.account.open",
    );
    assert.equal(
      toolByName(COMMERCE_MCP_TOOLS, "roxy_account_open").endpoint,
      "POST /browser/open",
    );

    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_account_list").handler(
        { keyword: "Amazon" },
        context,
      ),
      /Amazon Store A/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_account_get").handler(
        { id: "account-1" },
        context,
      ),
      /account-1/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_account_create").handler(
        { name: "Amazon Store B" },
        context,
      ),
      /created-account/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_account_update").handler(
        { id: "account-1", name: "Amazon Store C" },
        context,
      ),
      /Updated account/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_account_open").handler(
        { id: "account-1", force: true },
        context,
      ),
      /ws:\/\/account-1/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_account_close").handler(
        { id: "account-1" },
        context,
      ),
      /Closed account/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_account_delete").handler(
        { ids: ["account-1"], soft: false },
        context,
      ),
      /Deleted 1/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_proxy_list").handler({ source: "store" }, context),
      /HTTP/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_proxy_get").handler({ id: 1 }, context),
      /proxy.example.com/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_proxy_create").handler(
        { protocol: "HTTP", host: "proxy.example.com", port: "8080" },
        context,
      ),
      /Created proxy/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_proxy_create").handler(
        { proxies: [{ protocol: "HTTP", host: "proxy.example.com", port: "8080" }] },
        context,
      ),
      /Created 1/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_proxy_update").handler(
        { id: 1, remark: "new" },
        context,
      ),
      /Updated proxy/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_proxy_delete").handler({ ids: [1] }, context),
      /Deleted 1/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_proxy_detect").handler({ id: 1 }, context),
      /passed/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_proxy_detect_channels").handler({}, context),
      /IPRust/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_platform_credential_list").handler(
        { page: 1 },
        context,
      ),
      /sellercentral/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_platform_credential_create").handler(
        { platformUrl: "https://sellercentral.amazon.com" },
        context,
      ),
      /10/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_platform_credential_create").handler(
        { credentials: [{ platformUrl: "https://sellercentral.amazon.com" }] },
        context,
      ),
      /Created 1/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_platform_credential_update").handler(
        { id: 9, username: "seller2" },
        context,
      ),
      /Updated platform credential/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_platform_credential_delete").handler(
        { ids: [9] },
        context,
      ),
      /Deleted 1/,
    );
    assert.deepEqual(calls.find((call) => call[0] === "accounts.open")[2], { force: true });
    assert.equal(calls.find((call) => call[0] === "commerce.proxies.list")[1].source, "store");
  });

  test("formatters use empty and fallback labels consistently", () => {
    assert.equal(formatProfiles({ total: 0, rows: [] }), "No profiles found.");
    assert.match(formatProfile({ id: "profile-1", raw: {} }), /Profile: Unnamed/);
    assert.match(
      formatProfiles({ total: 1, rows: [{ id: "profile-1", raw: {} }] }),
      /core: Unknown/,
    );
    assert.equal(formatPlatformAccounts({ total: 0, rows: [] }), "No platform accounts found.");
    assert.match(
      formatPlatformAccounts({ total: 1, rows: [{ id: 1, raw: {} }] }),
      /Unknown platform/,
    );
    assert.equal(formatCommerceAccounts({ total: 0, rows: [] }), "No ecommerce accounts found.");
    assert.match(formatCommerceAccount({ id: "account-1", raw: {} }), /Account: Unnamed/);
  });
});
