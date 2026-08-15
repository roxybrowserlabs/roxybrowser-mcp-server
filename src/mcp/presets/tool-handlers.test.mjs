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
  normalizeProfileInputWithWarnings,
  normalizeProfileListArgs,
  normalizeProfileOpenOptions,
  normalizeProfileUpdateInputWithWarnings,
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

function parseJsonBlock(value) {
  const match = /^```json\n([\s\S]+)\n```$/.exec(value);
  assert.ok(match, "expected a JSON code block");
  return JSON.parse(match[1]);
}

describe("MCP tool handlers", () => {
  const longRemark = "12345678901234567890overflow";
  const unicodeRemark = "1234567890123456789😀overflow";

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
        sortNums: "11",
        os: "Windows",
      },
    );
    assert.deepEqual(normalizeProfileListArgs({ serialNumber: "ROX-11" }), {
      sortNums: "11",
    });
    assert.deepEqual(normalizeProfileListArgs({}), {});

    assert.deepEqual(
      normalizeProfileInput({
        name: "Alpha",
        projectId: 3,
        browserCore: "Chrome 150",
        os: "Windows 10",
        cookie: [
          {
            name: "sid",
            value: "abc",
            domain: ".example.com",
            path: "/",
            expires: -1,
            httpOnly: false,
            secure: false,
            sameSite: "Lax",
            session: true,
          },
        ],
        searchEngine: "DuckDuckGo",
        labelIds: [7, 8],
        proxyInfo: { id: 9 },
        urls: ["https://example.com"],
        remark: "memo",
        platformAccounts: [{ id: 12 }],
        fingerInfo: { language: "zh-CN", forbidAudio: true },
      }),
      {
        windowName: "Alpha",
        projectId: 3,
        coreType: "Chrome",
        coreVersion: "150",
        useLatestCore: 0,
        os: "Windows",
        osVersion: "10",
        cookie: [
          {
            name: "sid",
            value: "abc",
            domain: ".example.com",
            path: "/",
            expires: -1,
            httpOnly: false,
            secure: false,
            sameSite: "Lax",
            session: true,
          },
        ],
        searchEngine: "DuckDuckGo",
        labelIds: [7, 8],
        proxyInfo: { moduleId: 9, proxyMethod: "choose" },
        defaultOpenUrl: ["https://example.com"],
        windowRemark: "memo",
        windowPlatformList: [{ id: 12 }],
        fingerInfo: { language: "zh-CN", forbidAudio: true },
      },
    );
    assert.deepEqual(
      normalizeProfileInput({
        platformAccounts: [
          {
            platformUrl: "https://example.com",
            platformUserName: "seller",
            platformPassword: "secret",
            platformEfa: "2fa",
            platformRemarks: "memo",
          },
        ],
        proxyInfo: {
          moduleId: 4,
          proxyMethod: "custom",
          proxyCategory: "static",
          ipType: "IPV4",
          host: "proxy.example",
          port: "8080",
          proxyUserName: "proxy-user",
          proxyPassword: "proxy-pass",
          refreshUrl: "https://refresh.example",
          checkChannel: "https://check.example",
        },
      }),
      {
        windowPlatformList: [
          {
            platformUrl: "https://example.com",
            platformUserName: "seller",
            platformPassword: "secret",
            platformEfa: "2fa",
            platformRemarks: "memo",
          },
        ],
        proxyInfo: {
          moduleId: 4,
          proxyMethod: "custom",
          proxyCategory: "static",
          ipType: "IPV4",
          host: "proxy.example",
          port: "8080",
          proxyUserName: "proxy-user",
          proxyPassword: "proxy-pass",
          refreshUrl: "https://refresh.example",
          checkChannel: "https://check.example",
        },
      },
    );
    assert.deepEqual(normalizeProfileInput({ proxyId: 10 }), {
      proxyInfo: { moduleId: 10, proxyMethod: "choose" },
    });
    assert.deepEqual(
      normalizeProfileInput({
        cookie: [{ name: "sid", value: 123, domain: ".example.com", expiry: 2_000_000_000 }],
      }).cookie,
      [
        {
          name: "sid",
          value: "123",
          domain: ".example.com",
          expiry: 2_000_000_000,
          path: "/",
          expires: 2_000_000_000,
          httpOnly: false,
          secure: false,
          sameSite: "Lax",
          session: false,
        },
      ],
    );
    assert.deepEqual(
      normalizeProfileInput({
        cookie: "session=abc; theme=dark",
        platformAccounts: [{ platformUrl: "https://shop.example.com/login" }],
      }).cookie?.map(({ name, value, domain }) => ({ name, value, domain })),
      [
        { name: "session", value: "abc", domain: "shop.example.com" },
        { name: "theme", value: "dark", domain: "shop.example.com" },
      ],
    );
    assert.deepEqual(
      normalizeProfileInput({
        cookie: JSON.stringify({ name: "json", value: "value", domain: ".json.example" }),
      }).cookie?.map(({ name, domain }) => ({ name, domain })),
      [{ name: "json", domain: ".json.example" }],
    );
    assert.deepEqual(
      normalizeProfileInput({
        cookie: [
          "# Netscape HTTP Cookie File",
          ".example.com\tTRUE\t/\tFALSE\t2000000000\tnetscape\tvalue",
        ].join("\n"),
      }).cookie?.map(({ name, value, domain }) => ({ name, value, domain })),
      [{ name: "netscape", value: "value", domain: ".example.com" }],
    );
    assert.deepEqual(
      normalizeProfileInput({ cookie: "session=abc" }).cookie?.map(({ name, value, domain }) => ({
        name,
        value,
        domain,
      })),
      [{ name: "session", value: "abc", domain: "" }],
    );
    assert.equal(
      normalizeProfileInput({ cookie: { name: "single", value: "1" } }).cookie?.length,
      1,
    );
    assert.deepEqual(normalizeProfileInputWithWarnings({ cookie: 123 }), {
      input: {},
      warnings: ["Cookie was omitted because its input type is unsupported."],
    });
    assert.deepEqual(normalizeProfileInput({ core: { type: "Firefox", version: "140" } }), {
      coreType: "Firefox",
      coreVersion: "140",
    });
    assert.deepEqual(normalizeProfileInput({ browserCore: "ALL" }), {});
    assert.deepEqual(normalizeProfileInput({ browserCore: "Chrome Latest" }), {
      coreType: "Chrome",
      useLatestCore: 1,
    });
    assert.deepEqual(normalizeProfileInput({ browserCore: "Firefox Latest" }), {
      coreType: "Firefox",
      useLatestCore: 1,
    });
    assert.deepEqual(normalizeProfileUpdateInputWithWarnings({ coreVersion: "Latest" }), {
      input: { useLatestCore: 1 },
      warnings: [],
    });
    assert.deepEqual(
      normalizeProfileUpdateInputWithWarnings({
        coreVersion: "146",
        browserCore: "Firefox Latest",
        core: { type: "Chrome", version: "150" },
      }),
      {
        input: { coreVersion: "146", useLatestCore: 0 },
        warnings: [],
      },
    );
    assert.deepEqual(normalizeProfileInput({ os: "macOS 26" }), {
      os: "macOS",
      osVersion: "26",
    });
    assert.deepEqual(normalizeProfileInput({ os: "Linux ALL" }), {
      os: "Linux",
      osVersion: "ALL",
    });
    assert.deepEqual(normalizeProfileInput({ os: { name: "Windows", version: "11" } }), {
      os: "Windows",
      osVersion: "11",
    });
    assert.deepEqual(normalizeProfileInput({}), {});
    assert.deepEqual(normalizeProfileOpenOptions({ force: false, headless: true }), {
      forceOpen: false,
      headless: true,
    });
    assert.deepEqual(normalizeProfileDeleteOptions({ soft: false }), { isSoftDelete: false });

    assert.deepEqual(normalizeProxyListArgs({ source: "user", checkStatus: "passed" }), {
      proxyType: "0",
    });
    assert.deepEqual(
      normalizeProxyListArgs({
        source: "store",
        type: "available",
        bindStatus: "bound",
        autoRenew: true,
      }),
      {
        proxyType: "1",
        type: "available_list",
        proxyBindStatus: "1",
        proxyAutoRenew: "1",
      },
    );
    assert.deepEqual(
      normalizeProxyListArgs({ bindStatus: "unbound", autoRenew: false, checkStatus: "unknown" }),
      { proxyBindStatus: "0", proxyAutoRenew: "0" },
    );
    assert.deepEqual(normalizeProxyListArgs({ source: "all", bindStatus: "all" }), {});

    assert.deepEqual(
      normalizeProxyInput({
        protocol: "HTTP",
        host: "127.0.0.1",
        port: "8080",
        checkChannel: "http://iprust.io/ip.json",
        username: "user",
        password: "pass",
      }),
      {
        protocol: "HTTP",
        host: "127.0.0.1",
        port: "8080",
        ipType: "IPV4",
        checkChannel: "http://iprust.io/ip.json",
        proxyUserName: "user",
        proxyPassword: "pass",
      },
    );
    assert.equal(normalizeProxyInput({ host: "127.0.0.1", port: "1080" }).protocol, "SOCKS5");
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
    assert.deepEqual(normalizeCommerceAccountInput({ name: "Store", platform: [] }), {
      windowName: "Store",
    });
    assert.deepEqual(
      normalizeCommerceAccountInput({
        name: "Store",
        platform: { url: 123, username: "seller", password: false },
      }),
      {
        windowName: "Store",
        windowPlatformList: [{ platformUserName: "seller" }],
      },
    );
  });

  test("MCP output formatters keep lists compact and details complete", () => {
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
      windowRemark: longRemark,
      twoFactorKey: "otp-root",
      cookie: [{ name: "session", value: "secret" }],
      proxyInfo: { host: "proxy.example", proxyPassword: "secret" },
      windowPlatformList: [
        {
          platformUserName: "seller",
          platformPassword: "secret",
          platformEfa: "otp",
          platformCookies: [{ name: "session", value: "secret" }],
        },
      ],
    });
    const profileDetail = parseJsonBlock(profile);
    assert.equal(profileDetail.dirId, "profile-1");
    assert.equal(profileDetail.coreType, "Chrome");
    assert.equal(profileDetail.coreVersion, "140");
    assert.equal(profileDetail.osVersion, "11");
    assert.equal(profileDetail.windowRemark, longRemark);
    assert.equal(profileDetail.twoFactorKey, "otp-root");
    assert.deepEqual(profileDetail.proxyInfo, { host: "proxy.example" });
    assert.deepEqual(profileDetail.windowPlatformList, [
      { platformUserName: "seller", platformEfa: "otp" },
    ]);
    assert.doesNotMatch(profile, /cookie|password|secret/i);

    const profiles = formatProfiles({
      total: 3,
      page: 1,
      pageSize: 2,
      rows: [
        {
          dirId: "p1",
          projectId: 3,
          workspaceName: "Workspace",
          windowSortNum: 12,
          windowRemark: longRemark,
        },
        { dirId: "p2", projectId: 4, workspaceName: "Roxy", windowSortNum: 13, coreVersion: "140" },
        { dirId: "p3", workspaceName: "Main" },
      ],
    });
    assert.match(profiles, /^Profiles: 3 total \| page 1\/2 \| pageSize 2 \| nextPage 2/m);
    assert.match(profiles, /\| Name \| DirId \| SerialNumber \| Core \| OS \| Remark \|/);
    assert.match(profiles, /\| - \| p1 \| WOR-12 \| - \| - \| 12345678901234567890\.\.\. \|/);
    assert.match(profiles, /\| - \| p2 \| ROX-13 \| 140 \| - \| - \|/);
    assert.match(profiles, /\| - \| p3 \| - \| - \| - \| - \|/);
    assert.doesNotMatch(profiles, /N\/A|Unknown/);

    const futureProfiles = formatProfiles(
      {
        total: 1,
        rows: [{ dirId: "p4", windowName: "Named", projectName: "Ops", projectId: 9 }],
      },
      "4.0.4",
    );
    assert.match(
      futureProfiles,
      /\| Name \| DirId \| SerialNumber \| Project \| Core \| OS \| Remark \|/,
    );
    assert.match(futureProfiles, /\| Named \| p4 \| - \| Ops \| - \| - \| - \|/);

    const platformAccounts = formatPlatformAccounts({
      total: 4,
      rows: [
        {
          id: 1,
          platformUserName: "seller",
          platformName: "Amazon",
          platformUrl: "https://amazon.example",
          platformRemarks: longRemark,
        },
        { id: 2, platformName: "eBay" },
        { id: 3, platformUrl: "https://etsy.example" },
        { id: 4 },
      ],
    });
    assert.match(
      platformAccounts,
      /\| 1 \| seller \| https:\/\/amazon\.example \| 12345678901234567890\.\.\. \|/,
    );
    assert.match(platformAccounts, /\| 2 \| - \| - \| - \|/);
    assert.match(platformAccounts, /\| 3 \| - \| https:\/\/etsy\.example \| - \|/);
    assert.doesNotMatch(platformAccounts, /eBay/);

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
        { project_id: 3, project_name: "Snake case" },
        { project_name: "Legacy" },
        {},
      ],
    });
    assert.match(projects, /\| 1 \| One \|/);
    assert.match(projects, /\| 3 \| Snake case \|/);
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
          bindList: [11, 12],
          lastCountry: "US",
          expireDate: "2026-12-31",
          remark: longRemark,
        },
        { id: 2, dataType: "proxyModule", host: "127.0.0.1", checkStatus: 2 },
        { id: 3, dataType: "custom", protocol: "HTTP", checkStatus: 0 },
        { id: 4, checkStatus: "passed" },
      ],
    });
    assert.match(
      proxies,
      /\| 1 \| SOCKS5 proxy\.example:1080 \| US \| 2026-12-31 \| store \| passed \| 11, 12 \| 12345678901234567890\.\.\. \|/,
    );
    assert.match(
      proxies,
      /\| ID \| Proxy \| Country \| ExpireDate \| Source \| Status \| BoundProfileSerialNumbers \| Note \|/,
    );
    assert.match(proxies, /\| 2 \| 127\.0\.0\.1 \| - \| - \| user \| failed \| - \| - \|/);
    assert.match(proxies, /\| 3 \| HTTP \| - \| - \| custom \| unknown \| - \| - \|/);

    const proxy = formatProxy({
      id: 5,
      protocol: "HTTP",
      host: "detail.example",
      port: "80",
      checkStatus: "failed",
      proxyUserName: "user",
      checkChannelValue: "IPRust",
      lastCountry: "US",
      remark: longRemark,
      proxyPassword: "secret",
    });
    assert.deepEqual(parseJsonBlock(proxy), {
      id: 5,
      protocol: "HTTP",
      host: "detail.example",
      port: "80",
      checkStatus: "failed",
      proxyUserName: "user",
      checkChannelValue: "IPRust",
      lastCountry: "US",
      remark: longRemark,
    });
    assert.deepEqual(parseJsonBlock(formatProxy({ id: 6, checkStatus: "invalid" })), {
      id: 6,
      checkStatus: "invalid",
    });

    const noConnections =
      "No opened browsers found.\n\nUse `roxy_profile_open` to open a browser profile first.";
    assert.equal(formatConnections([]), noConnections);
    assert.equal(formatConnections([{}]), noConnections);
    const connections = formatConnections([
      { dirId: "p1", windowName: "Alpha", ws: "ws://p1", http: "http://p1", pid: 10 },
      {
        dirId: "p2",
        windowName: "Firefox",
        ws: "ws://p2",
        http: "http://should-not-be-shown",
        marionette_port: 2828,
      },
    ]);
    assert.match(connections, /^Found 2 opened browser\(s\):/);
    assert.match(connections, /\*\*Alpha\*\* \(p1\)\n- CDP WebSocket: `ws:\/\/p1`/);
    assert.match(connections, /- HTTP Endpoint: `http:\/\/p1`\n- Core Type: Chrome/);
    assert.match(connections, /\*\*Firefox\*\* \(p2\)\n- BiDi WebSocket: `ws:\/\/p2`/);
    assert.match(connections, /- Core Type: Firefox/);
    assert.doesNotMatch(connections, /should-not-be-shown/);

    assert.equal(formatDetectChannels([]), "No detect channels found.");
    const channels = formatDetectChannels([
      { label: "IPRust", value: "https://iprust.example", type: "url" },
      { value: "direct" },
      { label: "same", value: "same" },
      {},
    ]);
    assert.match(channels, /\| IPRust \| https:\/\/iprust\.example \| url \|/);
    assert.match(channels, /\| - \| direct \| - \|/);

    const accounts = formatCommerceAccounts(
      {
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
          { dirId: "a3", projectId: 4, openStatus: 1 },
          { dirId: "a4", openStatus: 0 },
        ],
      },
      "4.0.4",
    );
    assert.match(accounts, /\| Store \| a1 \| Ops \(3\) \| open \|/);
    assert.match(accounts, /\| - \| a2 \| Named \| closed \|/);
    assert.match(accounts, /\| - \| a3 \| 4 \| open \|/);
    assert.match(accounts, /\| - \| a4 \| - \| closed \|/);

    const oldAccounts = formatCommerceAccounts(
      {
        total: 1,
        rows: [{ dirId: "a5", windowName: "Store", projectName: "Ops", openStatus: true }],
      },
      "3.0.0",
    );
    assert.match(oldAccounts, /\| Name \| dirId \| Status \|/);
    assert.match(oldAccounts, /\| Store \| a5 \| open \|/);
    assert.deepEqual(
      parseJsonBlock(formatCommerceAccount({ dirId: "a5", windowRemark: unicodeRemark })),
      { dirId: "a5", windowRemark: unicodeRemark },
    );
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
                  projectId: 3,
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
          createWithResult: async (args) => {
            calls.push(["profiles.create", args]);
            return { id: "created-profile", message: "profile created" };
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
          createWithResult: async (args) => {
            calls.push(["proxies.create", args]);
            return { message: "proxy created" };
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
          createWithResult: async (args) => {
            calls.push(["platformAccounts.create", args]);
            return { id: 6, message: "account created" };
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
        { profiles: [{ name: "Created" }] },
        context,
      ),
      /created-profile/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_update").handler(
        { dirId: "profile-1", name: "Updated", coreVersion: "150", os: "Windows 10" },
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
        { dirIds: ["profile-1"], type: "partial" },
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
        {
          checkChannel: "http://iprust.io/ip.json",
          proxies: [{ ipType: "IPV4", host: "127.0.0.1", port: "1080" }],
        },
        context,
      ),
      /Proxy creation: 1 requested \| 1 succeeded \| 0 failed/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_proxy_create").handler(
        {
          checkChannel: "http://iprust.io/ip.json",
          proxies: [{ ipType: "IPV4", protocol: "SOCKS5", host: "127.0.0.1", port: "1080" }],
        },
        context,
      ),
      /Proxy creation: 1 requested \| 1 succeeded \| 0 failed/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_proxy_update").handler(
        {
          id: 1,
          checkChannel: "http://iprust.io/ip.json",
          ipType: "IPV4",
          protocol: "HTTPS",
          host: "127.0.0.2",
          port: "8443",
          remark: "new",
        },
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
      /Detected proxy 1/,
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
        { accounts: [{ platformUrl: "https://example.com" }] },
        context,
      ),
      /Platform account creation: 1 requested \| 1 succeeded \| 0 failed/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_platform_account_create").handler(
        { accounts: [{ platformUrl: "https://example.com" }] },
        context,
      ),
      /Platform account creation: 1 requested \| 1 succeeded \| 0 failed/,
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_platform_account_update").handler(
        { id: 5, platformUrl: "https://example.com", username: "seller2" },
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
    assert.deepEqual(calls.find((call) => call[0] === "profiles.update").slice(1), [
      "profile-1",
      {
        windowName: "Updated",
        coreVersion: "150",
        useLatestCore: 0,
        os: "Windows",
        osVersion: "10",
      },
    ]);
    assert.equal(
      calls.some((call) => call[0] === "proxies.createMany"),
      false,
    );
    assert.deepEqual(calls.find((call) => call[0] === "proxies.create")[1], {
      checkChannel: "http://iprust.io/ip.json",
      ipType: "IPV4",
      protocol: "SOCKS5",
      host: "127.0.0.1",
      port: "1080",
    });
    assert.deepEqual(calls.find((call) => call[0] === "proxies.update").slice(1), [
      1,
      {
        checkChannel: "http://iprust.io/ip.json",
        ipType: "IPV4",
        protocol: "HTTPS",
        host: "127.0.0.2",
        port: "8443",
        remark: "new",
      },
    ]);
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

  test("browser create tools run sequentially and report every item", async () => {
    let active = 0;
    let maxActive = 0;
    const order = [];
    const sequential = async (kind, item, result) => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      order.push(`${kind}:${item}:start`);
      await new Promise((resolve) => setTimeout(resolve, 1));
      order.push(`${kind}:${item}:end`);
      active -= 1;
      if (item.includes("bad")) throw new Error(`backend message for ${item}`);
      return result;
    };
    const context = {
      browser: {
        profiles: {
          createWithResult: (input) =>
            sequential("profile", input.windowName, {
              id: `id-${input.windowName}`,
              message: `created ${input.windowName}`,
            }),
          update: async () => {},
        },
        proxies: {
          createWithResult: (input) =>
            sequential("proxy", input.host, { message: `created ${input.host}` }),
        },
        platformAccounts: {
          createWithResult: (input) =>
            sequential("account", input.platformUrl, {
              id: input.platformUrl.length,
              message: `created ${input.platformUrl}`,
            }),
        },
      },
    };

    const profiles = await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_create").handler(
      {
        profiles: [
          { name: "one", cookie: "invalid-cookie-text" },
          { name: "bad-two" },
          { name: "three" },
        ],
      },
      context,
    );
    assert.match(profiles, /3 requested \| 2 succeeded \| 1 failed/);
    assert.match(profiles, /\| # \| Item \| Status \| DirId \| Message \| Warnings \|/);
    assert.match(profiles, /id-one/);
    assert.match(profiles, /backend message for bad-two/);
    assert.match(profiles, /Cookie was omitted because parsing failed/);
    assert.deepEqual(order.slice(0, 6), [
      "profile:one:start",
      "profile:one:end",
      "profile:bad-two:start",
      "profile:bad-two:end",
      "profile:three:start",
      "profile:three:end",
    ]);

    const proxies = await toolByName(BROWSER_MCP_TOOLS, "roxy_proxy_create").handler(
      {
        checkChannel: "channel",
        proxies: [
          { ipType: "IPV4", protocol: "HTTP", host: "one", port: "1" },
          { ipType: "IPV4", protocol: "HTTP", host: "bad-two", port: "2" },
        ],
      },
      context,
    );
    assert.match(proxies, /2 requested \| 1 succeeded \| 1 failed/);
    assert.match(proxies, /backend message for bad-two/);

    const accounts = await toolByName(BROWSER_MCP_TOOLS, "roxy_platform_account_create").handler(
      {
        accounts: [{ platformUrl: "https://one.example" }, { platformUrl: "bad-account" }],
      },
      context,
    );
    assert.match(accounts, /2 requested \| 1 succeeded \| 1 failed/);
    assert.match(accounts, /backend message for bad-account/);
    assert.equal(maxActive, 1);

    const updated = await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_update").handler(
      { dirId: "profile-1", cookie: "invalid-cookie-text" },
      context,
    );
    assert.match(updated, /Warning: Cookie was omitted because parsing failed/);
  });

  test("browser create tools reject more than 30 items before creating", async () => {
    let calls = 0;
    const context = {
      browser: {
        profiles: {
          createWithResult: async () => {
            calls += 1;
          },
        },
      },
    };
    await assert.rejects(
      toolByName(BROWSER_MCP_TOOLS, "roxy_profile_create").handler(
        { profiles: Array.from({ length: 31 }, (_, index) => ({ name: `profile-${index}` })) },
        context,
      ),
      /maximum is 30; no items were created/,
    );
    assert.equal(calls, 0);
  });

  test("profile creation adjusts Firefox macOS versions to ALL", async () => {
    const calls = [];
    const result = await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_create").handler(
      {
        profiles: [
          { name: "Firefox macOS", browserCore: "Firefox 146", os: "macOS 26" },
          { name: "Chrome macOS", browserCore: "Chrome 150", os: "macOS 26" },
        ],
      },
      {
        browser: {
          profiles: {
            createWithResult: async (input) => {
              calls.push(input);
              return { id: `id-${calls.length}`, message: "created" };
            },
          },
        },
      },
    );

    assert.equal(result.includes("2 requested | 2 succeeded | 0 failed"), true);
    assert.match(
      result,
      /created OS was adjusted from macOS 26 to macOS ALL because Firefox profiles only support macOS ALL\./,
    );
    assert.deepEqual(calls[0], {
      windowName: "Firefox macOS",
      coreType: "Firefox",
      coreVersion: "146",
      useLatestCore: 0,
      os: "macOS",
      osVersion: "ALL",
    });
    assert.equal(calls[1].osVersion, "26");
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
    assert.deepEqual(
      parseJsonBlock(
        formatProfile({
          dirId: "profile-rich",
          windowName: "Rich Profile",
          coreType: "Chrome",
          coreVersion: "140",
          os: "Windows",
          osVersion: "11",
        }),
      ),
      {
        dirId: "profile-rich",
        windowName: "Rich Profile",
        coreType: "Chrome",
        coreVersion: "140",
        os: "Windows",
        osVersion: "11",
      },
    );
    assert.deepEqual(
      parseJsonBlock(
        formatCommerceAccount({ dirId: "account-rich", windowName: "Store A", projectId: 9 }),
      ),
      { dirId: "account-rich", windowName: "Store A", projectId: 9 },
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
      /\*\*Unnamed\*\* \(profile-empty\)\n- Core Type: Chrome/,
    );
    assert.equal(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_profile_connection_info").handler(
        {},
        browserContext,
      ),
      "No opened browsers found.\n\nUse `roxy_profile_open` to open a browser profile first.",
    );
    assert.match(
      await toolByName(BROWSER_MCP_TOOLS, "roxy_proxy_list").handler({}, browserContext),
      /Proxies: 1/,
    );
  });

  test("commerce preset tool catalog is intentionally empty", () => {
    assert.deepEqual(COMMERCE_MCP_TOOLS, []);
  });

  test("formatters use empty and fallback labels consistently", () => {
    assert.equal(
      formatProfiles({ total: 0, rows: [] }),
      "Profiles: 0 total | page 1/1 | pageSize 15\nNo profiles found.",
    );
    assert.deepEqual(parseJsonBlock(formatProfile({ dirId: "profile-1" })), {
      dirId: "profile-1",
    });
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
      "Platform accounts: 1 total | page 1/1 | pageSize 1\n| ID | Username | Platform URL | Note |\n| --- | --- | --- | --- |\n| 1 | - | - | - |",
    );
    assert.equal(
      formatCommerceAccounts({ total: 0, rows: [] }),
      "Accounts: 0 total | page 1/1 | pageSize 15\nNo ecommerce accounts found.",
    );
    assert.deepEqual(parseJsonBlock(formatCommerceAccount({ dirId: "account-1" })), {
      dirId: "account-1",
    });
  });
});
