import assert from "node:assert/strict";
import { describe, test } from "vite-plus/test";
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
} from "../../../lib/mcp/presets/browser/formatters.js";
import {
  normalizePlatformAccountInput,
  normalizeProfileDeleteOptions,
  normalizeProfileInput,
  normalizeProfileListArgs,
  normalizeProfileOpenOptions,
  normalizeProxyInput,
  normalizeProxyListArgs,
} from "../../../lib/mcp/presets/browser/inputs.js";
import {
  formatCommerceAccount,
  formatCommerceAccounts,
} from "../../../lib/mcp/presets/commerce/formatters.js";
import {
  normalizeCommerceAccountInput,
  normalizeCommerceAccountListArgs,
} from "../../../lib/mcp/presets/commerce/inputs.js";
import { BROWSER_MCP_TOOLS } from "../../../lib/mcp/presets/browser/tools.js";
import { COMMERCE_MCP_TOOLS } from "../../../lib/mcp/presets/commerce/tools.js";

function toolByName(tools, name) {
  const tool = tools.find((candidate) => candidate.name === name);
  assert.ok(tool, `missing tool ${name}`);
  return tool;
}

describe("MCP tool handlers", () => {
  test("MCP input adapters convert friendly fields to API fields", () => {
    assert.deepEqual(
      normalizeProfileListArgs({
        page: 2,
        pageSize: 10,
        dirIds: ["profile-1", "profile-2"],
        projectIds: [3, 4],
        name: "Alpha",
        serialNumber: "11",
        os: "Windows",
      }),
      {
        page: 2,
        pageSize: 10,
        dirIds: "profile-1,profile-2",
        projectIds: "3,4",
        windowName: "Alpha",
        windowSortNum: "11",
        os: "Windows",
      },
    );
    assert.deepEqual(normalizeProfileListArgs({}), {});

    assert.deepEqual(
      normalizeProfileInput({
        name: "Alpha",
        projectId: 3,
        core: { type: "Chrome", version: "140" },
        os: { name: "Windows", version: "11" },
        proxyId: 9,
        urls: ["https://example.com"],
        remark: "memo",
        platformAccounts: [{ platformUrl: "https://example.com", username: "seller" }],
      }),
      {
        windowName: "Alpha",
        projectId: 3,
        coreType: "Chrome",
        coreVersion: "140",
        os: "Windows",
        osVersion: "11",
        proxyInfo: { moduleId: 9, proxyMethod: "choose" },
        defaultOpenUrl: ["https://example.com"],
        windowRemark: "memo",
        windowPlatformList: [{ platformUrl: "https://example.com", platformUserName: "seller" }],
      },
    );
    assert.deepEqual(normalizeProfileInput({}), {});
    assert.deepEqual(normalizeProfileOpenOptions({ force: false, headless: true }), {
      forceOpen: false,
      headless: true,
    });
    assert.deepEqual(normalizeProfileDeleteOptions({ soft: false }), { isSoftDelete: false });

    assert.deepEqual(normalizeProxyListArgs({ source: "user", checkStatus: "passed" }), {
      proxyType: "0",
      check_status: 1,
    });
    assert.deepEqual(
      normalizeProxyListArgs({
        source: "store",
        type: "available",
        bindStatus: "bound",
        autoRenew: true,
        checkStatus: "failed",
      }),
      {
        proxyType: "1",
        type: "available_list",
        proxyBindStatus: "1",
        proxyAutoRenew: "1",
        check_status: 2,
      },
    );
    assert.deepEqual(
      normalizeProxyListArgs({ bindStatus: "unbound", autoRenew: false, checkStatus: "unknown" }),
      { proxyBindStatus: "0", proxyAutoRenew: "0", check_status: 0 },
    );
    assert.deepEqual(normalizeProxyListArgs({ source: "all", bindStatus: "all" }), {});

    assert.deepEqual(
      normalizeProxyInput({
        protocol: "HTTP",
        host: "127.0.0.1",
        port: "8080",
        username: "user",
        password: "pass",
      }),
      {
        protocol: "HTTP",
        host: "127.0.0.1",
        port: "8080",
        ipType: "IPV4",
        proxyUserName: "user",
        proxyPassword: "pass",
      },
    );
    assert.equal(normalizeProxyInput({ ipType: "IPV6" }).ipType, "IPV6");
    assert.deepEqual(
      normalizePlatformAccountInput({
        platformUrl: "https://example.com",
        username: "seller",
        password: "secret",
        twoFactorKey: "otp",
        remarks: "memo",
      }),
      {
        platformUrl: "https://example.com",
        platformUserName: "seller",
        platformPassword: "secret",
        platformEfa: "otp",
        platformRemarks: "memo",
      },
    );

    assert.deepEqual(normalizeCommerceAccountListArgs({ keyword: "Amazon" }), {
      windowName: "Amazon",
    });
    assert.deepEqual(
      normalizeCommerceAccountInput({
        name: "Store",
        platform: { url: "https://example.com", username: "seller" },
      }),
      {
        windowName: "Store",
        windowPlatformList: [{ platformUrl: "https://example.com", platformUserName: "seller" }],
      },
    );
    assert.deepEqual(normalizeCommerceAccountInput({ name: "Store" }), {
      windowName: "Store",
    });
  });

  test("MCP output formatters keep natural language compact and semantic", () => {
    const profile = formatProfile({
      dirId: "profile-1",
      windowName: "Alpha",
      windowSortNum: 11,
      coreType: "Chrome",
      coreVersion: "140",
      os: "Windows",
      osVersion: "11",
      projectId: 3,
      projectName: "Ops",
      openStatus: true,
      workspaceName: "Main",
      windowRemark: "VIP",
    });
    assert.equal(
      profile,
      "Profile\n- Alpha | dirId: profile-1 | serial: MAI-11 | core: Chrome 140 | os: Windows 11 | project: Ops (3) | status: open | workspace: Main | note: VIP",
    );
    assert.doesNotMatch(profile, /coreType|coreVersion|osVersion|N\/A|Unknown/);

    const profiles = formatProfiles({
      total: 3,
      page: 1,
      pageSize: 2,
      rows: [
        {
          dirId: "p1",
          workspaceName: "Workspace",
          windowSortNum: 12,
          windowRemark: "Primary",
        },
        { dirId: "p2", workspaceName: "Roxy", windowSortNum: 13, coreVersion: "140" },
        { dirId: "p3" },
      ],
    });
    assert.match(profiles, /^Profiles: 3 total \| page 1\/2 \| pageSize 2 \| nextPage 2/m);
    assert.match(profiles, /\| Name \| DirId \| Serial \| Core \| OS \| Remark \|/);
    assert.match(profiles, /\| - \| p1 \| WOR-12 \| - \| - \| Primary \|/);
    assert.match(profiles, /\| - \| p2 \| ROX-13 \| 140 \| - \| - \|/);
    assert.doesNotMatch(profiles, /N\/A|Unknown/);

    const platformAccounts = formatPlatformAccounts({
      total: 4,
      rows: [
        {
          id: 1,
          platformUserName: "seller",
          platformName: "Amazon",
          platformUrl: "https://amazon.example",
          platformRemarks: "main",
        },
        { id: 2, platformName: "eBay" },
        { id: 3, platformUrl: "https://etsy.example" },
        { id: 4 },
      ],
    });
    assert.match(
      platformAccounts,
      /\| 1 \| seller \| Amazon \| https:\/\/amazon\.example \| main \|/,
    );
    assert.match(platformAccounts, /\| 2 \| - \| eBay \| - \| - \|/);
    assert.match(platformAccounts, /\| 3 \| - \| - \| https:\/\/etsy\.example \| - \|/);

    assert.match(
      formatWorkspaces({
        total: 2,
        rows: [
          {
            id: 77,
            workspaceName: "Main",
            project_details: [
              { projectId: 3, projectName: "Ops" },
              { name: "Name only" },
              { id: 4 },
              {},
            ],
          },
          { id: 88, workspaceName: "Empty", project_details: [] },
        ],
      }),
      /\| 77 \| Main \| Ops \(3\), Name only, 4 \|/,
    );
    const projects = formatProjects({
      total: 4,
      rows: [
        { projectId: 1, projectName: "One" },
        { id: 2, name: "Two" },
        { project_name: "Legacy" },
        {},
      ],
    });
    assert.match(projects, /\| 1 \| One \|/);
    assert.match(projects, /\| - \| Legacy \|/);
    assert.match(projects, /\| - \| - \|/);
    assert.equal(formatLabels([]), "No labels found.");
    assert.match(
      formatLabels([{ id: 1, name: "VIP | Main\nLine", color: "#fff" }]),
      /\| 1 \| VIP \\\| Main Line \| #fff \|/,
    );

    const proxies = formatProxies({
      total: 4,
      rows: [
        {
          id: 1,
          dataType: "buyProxy",
          protocol: "SOCKS5",
          host: "proxy.example",
          port: "1080",
          checkStatus: 1,
          bindCount: 2,
          remark: "main",
        },
        { id: 2, dataType: "proxyModule", host: "127.0.0.1", checkStatus: 2 },
        { id: 3, dataType: "custom", protocol: "HTTP", checkStatus: 0 },
        { id: 4, checkStatus: "passed" },
      ],
    });
    assert.match(proxies, /\| 1 \| SOCKS5 proxy\.example:1080 \| store \| passed \| 2 \| main \|/);
    assert.match(proxies, /\| 2 \| 127\.0\.0\.1 \| user \| failed \| - \| - \|/);
    assert.match(proxies, /\| 3 \| HTTP \| custom \| unknown \| - \| - \|/);

    const proxy = formatProxy({
      id: 5,
      protocol: "HTTP",
      host: "detail.example",
      port: "80",
      checkStatus: "failed",
      proxyUserName: "user",
      checkChannelValue: "IPRust",
      lastCountry: "US",
    });
    assert.match(proxy, /username: user \| check: IPRust \| location: US/);
    assert.doesNotMatch(formatProxy({ id: 6, checkStatus: "invalid" }), /status:/);

    assert.equal(formatConnections([]), "No connection info found.");
    assert.equal(formatConnections([{}]), "No connection info found.");
    assert.match(
      formatConnections([
        { dirId: "p1", windowName: "Alpha", ws: "ws://p1", http: "http://p1", pid: 10 },
        { ws: "ws://anonymous", http: "" },
      ]),
      /\| Alpha \| p1 \| ws:\/\/p1 \| http:\/\/p1 \| 10 \|/,
    );

    assert.equal(formatDetectChannels([]), "No detect channels found.");
    const channels = formatDetectChannels([
      { label: "IPRust", value: "https://iprust.example", type: "url" },
      { value: "direct" },
      { label: "same", value: "same" },
      {},
    ]);
    assert.match(channels, /\| IPRust \| https:\/\/iprust\.example \| url \|/);
    assert.match(channels, /\| - \| direct \| - \|/);

    const accounts = formatCommerceAccounts({
      total: 4,
      rows: [
        {
          dirId: "a1",
          windowName: "Store",
          projectName: "Ops",
          projectId: 3,
          openStatus: true,
        },
        { dirId: "a2", projectName: "Named", openStatus: false },
        { dirId: "a3", projectId: 4 },
        { dirId: "a4" },
      ],
    });
    assert.match(accounts, /\| Store \| a1 \| Ops \(3\) \| open \|/);
    assert.match(accounts, /\| - \| a2 \| Named \| closed \|/);
    assert.match(accounts, /\| - \| a3 \| 4 \| - \|/);
    assert.match(formatCommerceAccount({ dirId: "a5", windowRemark: "memo" }), /note: memo/);
  });

  test("browser preset handlers use SDK operations and stable debug metadata", async () => {
    const calls = [];
    const context = {
      browser: {
        workspaces: {
          list: async (args) => {
            calls.push(["workspaces.list", args]);
            return { total: 1, rows: [{ id: 77, workspaceName: "Default workspace" }] };
          },
        },
        projects: {
          list: async (args) => {
            calls.push(["projects.list", args]);
            return { total: 1, rows: [{ projectId: 3, projectName: "Project A" }] };
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
              rows: [
                {
                  dirId: "profile-1",
                  windowName: "Alpha",
                  workspaceName: "Default workspace",
                  windowSortNum: 11,
                },
              ],
            };
          },
          get: async (dirId) => {
            calls.push(["profiles.get", dirId]);
            return { dirId, windowName: "Alpha" };
          },
          create: async (args) => {
            calls.push(["profiles.create", args]);
            return { dirId: "created-profile", windowName: args.windowName };
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
          connectionInfo: async (dirIds) => {
            calls.push(["profiles.connectionInfo", dirIds]);
            return [{ dirId: dirIds, ws: `ws://${dirIds}` }];
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
                {
                  id: 1,
                  dataType: "proxyModule",
                  protocol: "SOCKS5",
                  host: "127.0.0.1",
                  port: "1080",
                },
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
              rows: [
                {
                  id: 5,
                  platformUrl: "https://example.com",
                  platformUserName: "seller",
                },
              ],
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
    assert.match(profileList, /\| Alpha \| profile-1 \| DEF-11 \|/);
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_get").handler(
        { dirId: "profile-1" },
        context,
      ),
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
        { dirId: "profile-1", name: "Updated" },
        context,
      ),
      /Updated profile/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_open").handler(
        { dirId: "profile-1", force: true, args: ["--flag"] },
        context,
      ),
      /ws:\/\/profile-1/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_close").handler(
        { dirId: "profile-1" },
        context,
      ),
      /Closed profile/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_delete").handler(
        { dirIds: ["profile-1"], soft: false },
        context,
      ),
      /Deleted 1/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_connection_info").handler(
        { dirIds: ["profile-1"] },
        context,
      ),
      /ws:\/\/profile-1/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_randomize_fingerprint").handler(
        { dirId: "profile-1" },
        context,
      ),
      /Randomized fingerprint/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_clear_local_cache").handler(
        { dirIds: ["profile-1"], type: "cookie" },
        context,
      ),
      /Cleared local cache/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_clear_server_cache").handler(
        { dirIds: ["profile-1"] },
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

    assert.equal(calls.find((call) => call[0] === "proxies.list")[1].proxyType, undefined);
    assert.deepEqual(calls.find((call) => call[0] === "profiles.open")[2], {
      forceOpen: true,
      args: ["--flag"],
    });
    assert.equal(calls.find((call) => call[0] === "profiles.create")[1].windowName, "Created");
    assert.equal(calls.find((call) => call[0] === "profiles.update")[2].windowName, "Updated");
    assert.equal(
      calls.find((call) => call[0] === "platformAccounts.update")[2].platformUserName,
      "seller2",
    );
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
    assert.equal(text, "Proxies: 0 total | page 1/1 | pageSize 15\nNo proxies found.");
  });

  test("MCP handlers cover empty states and optional output fallbacks", async () => {
    assert.match(
      formatProfiles({
        total: 1,
        rows: [
          {
            dirId: "profile-rich",
            windowName: "Rich Profile",
            workspaceName: "Main workspace",
            windowSortNum: 7,
            coreType: "Chrome",
            coreVersion: "140",
            os: "Windows",
            osVersion: "11",
            windowRemark: "VIP",
          },
        ],
      }),
      /\| Rich Profile \| profile-rich \| MAI-7 \| Chrome 140 \| Windows 11 \| VIP \|/,
    );
    assert.match(
      formatProfile({
        dirId: "profile-rich",
        windowName: "Rich Profile",
        coreType: "Chrome",
        coreVersion: "140",
        os: "Windows",
        osVersion: "11",
      }),
      /os: Windows 11/,
    );
    assert.match(
      formatCommerceAccount({ dirId: "account-rich", windowName: "Store A", projectId: 9 }),
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
      "Workspaces: 0 total | page 1/1 | pageSize 15\nNo workspaces found.",
    );
    assert.equal(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_project_list").handler({}, browserContext),
      "Projects: 0 total | page 1/1 | pageSize 15\nNo projects found.",
    );
    assert.equal(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_label_list").handler({}, browserContext),
      "No labels found.",
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_open").handler(
        { dirId: "profile-empty" },
        browserContext,
      ),
      /\| - \| profile-empty \|/,
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
      /Proxies: 1/,
    );

    const commerceContext = {
      commerce: {
        accounts: { open: async () => ({}) },
        proxies: { list: async () => ({ total: 1, rows: [{ id: 1 }] }) },
      },
    };
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_account_open").handler(
        { dirId: "account-empty" },
        commerceContext,
      ),
      /\| - \| account-empty \|/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_proxy_list").handler({}, commerceContext),
      /Proxies: 1/,
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
              rows: [{ dirId: "account-1", windowName: "Amazon Store A", projectId: 3 }],
            };
          },
          get: async (id) => {
            calls.push(["accounts.get", id]);
            return { dirId: id, windowName: "Amazon Store A" };
          },
          create: async (args) => {
            calls.push(["accounts.create", args]);
            return { dirId: "created-account", windowName: args.windowName };
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
                  dataType: "buyProxy",
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
                  platformUserName: "seller",
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
        { dirId: "account-1" },
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
        { dirId: "account-1", name: "Amazon Store C" },
        context,
      ),
      /Updated account/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_account_open").handler(
        { dirId: "account-1", force: true },
        context,
      ),
      /ws:\/\/account-1/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_account_close").handler(
        { dirId: "account-1" },
        context,
      ),
      /Closed account/,
    );
    assert.match(
      await toolByName(COMMERCE_MCP_TOOLS, "roxy_account_delete").handler(
        { dirIds: ["account-1"], soft: false },
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
    assert.deepEqual(calls.find((call) => call[0] === "accounts.open")[2], {
      forceOpen: true,
    });
    assert.equal(calls.find((call) => call[0] === "commerce.proxies.list")[1].proxyType, "1");
    assert.equal(calls.find((call) => call[0] === "accounts.list")[1].windowName, "Amazon");
    assert.equal(
      calls.find((call) => call[0] === "accounts.create")[1].windowName,
      "Amazon Store B",
    );
  });

  test("formatters use empty and fallback labels consistently", () => {
    assert.equal(
      formatProfiles({ total: 0, rows: [] }),
      "Profiles: 0 total | page 1/1 | pageSize 15\nNo profiles found.",
    );
    assert.match(formatProfile({ dirId: "profile-1" }), /- - \| dirId: profile-1/);
    assert.doesNotMatch(
      formatProfiles({ total: 1, rows: [{ dirId: "profile-1" }] }),
      /Unknown|N\/A/,
    );
    assert.equal(
      formatPlatformAccounts({ total: 0, rows: [] }),
      "Platform accounts: 0 total | page 1/1 | pageSize 15\nNo platform accounts found.",
    );
    assert.equal(
      formatPlatformAccounts({ total: 1, rows: [{ id: 1 }] }),
      "Platform accounts: 1 total | page 1/1 | pageSize 1\n| ID | Username | Platform | URL | Note |\n| --- | --- | --- | --- | --- |\n| 1 | - | - | - | - |",
    );
    assert.equal(
      formatCommerceAccounts({ total: 0, rows: [] }),
      "Accounts: 0 total | page 1/1 | pageSize 15\nNo ecommerce accounts found.",
    );
    assert.match(formatCommerceAccount({ dirId: "account-1" }), /- - \| dirId: account-1/);
  });
});
