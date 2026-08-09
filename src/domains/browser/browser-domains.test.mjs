import assert from "node:assert/strict";
import { describe, test } from "vite-plus/test";
import {
  PlatformAccountDomain,
  ProfileDomain,
  ProjectDomain,
  ProxyDomain,
  WorkspaceDomain,
} from "../../../lib/domains/browser/index.js";
import { asArray } from "../../../lib/sdk/shared/ids.js";
import { ensureSuccess, unwrapData } from "../../../lib/sdk/shared/result.js";

function ok(data = {}) {
  return { code: 0, msg: "ok", data };
}

function createApiRecorder() {
  const calls = [];
  const api = {
    workspace: {
      list: async (params) => {
        calls.push(["workspace.list", params]);
        return ok({
          total: 2,
          rows: [
            {
              id: 77,
              workspaceName: "Main Workspace",
              project_details: [{ projectId: 3, projectName: "Ops" }],
            },
            {
              id: 88,
              workspaceName: "Secondary Workspace",
              project_details: [{ id: 4, name: "Fallback Ops" }, {}],
            },
          ],
        });
      },
      projects: async (params) => {
        calls.push(["workspace.projects", params]);
        return ok([{ id: 4, name: "Fallback Project" }]);
      },
    },
    browser: {
      list: async (params) => {
        calls.push(["browser.list", params]);
        return ok({
          total: 1,
          rows: [
            {
              dirId: "profile-1",
              windowSortNum: 11,
              windowName: "Alpha",
              coreType: "Chrome",
              coreVersion: "140",
              os: "Windows",
              osVersion: "11",
              windowRemark: "memo",
              projectId: 3,
            },
          ],
        });
      },
      detail: async (params) => {
        calls.push(["browser.detail", params]);
        return ok({
          total: params.dirId === "missing" ? 0 : 1,
          rows: params.dirId === "missing" ? [] : [{ dirId: params.dirId, windowName: "Detail" }],
        });
      },
      create: async (params) => {
        calls.push(["browser.create", params]);
        return ok({ dirId: "created-profile" });
      },
      modify: async (params) => {
        calls.push(["browser.modify", params]);
        return ok();
      },
      delete: async (params) => {
        calls.push(["browser.delete", params]);
        return ok();
      },
      open: async (params) => {
        calls.push(["browser.open", params]);
        return ok({
          dirId: params.dirId,
          ws: `ws://${params.dirId}`,
          http: `http://${params.dirId}`,
        });
      },
      close: async (params) => {
        calls.push(["browser.close", params]);
        return ok();
      },
      connectionInfo: async (params) => {
        calls.push(["browser.connectionInfo", params]);
        return ok([{ dirId: "profile-1", ws: "ws://profile-1", http: "http://profile-1" }]);
      },
      randomEnv: async (params) => {
        calls.push(["browser.randomEnv", params]);
        return ok();
      },
      clearLocalCache: async (params) => {
        calls.push(["browser.clearLocalCache", params]);
        return ok();
      },
      clearServerCache: async (params) => {
        calls.push(["browser.clearServerCache", params]);
        return ok();
      },
      accounts: async (params) => {
        calls.push(["browser.accounts", params]);
        return ok({
          total: 1,
          rows: [
            {
              id: 6,
              platformUrl: "https://available.example.com",
              platformUserName: "available-seller",
            },
          ],
        });
      },
    },
    proxy: {
      listMerged: async (params) => {
        calls.push(["proxy.listMerged", params]);
        return ok({
          total: 1,
          rows: [
            {
              id: 395935,
              dataType: "buyProxy",
              protocol: "SOCKS5",
              host: "gate12.rola.vip",
              port: "2000",
              bindCount: 2,
            },
          ],
        });
      },
      detail: async (params) => {
        calls.push(["proxy.detail", params]);
        if (params.id === 0) return ok({ total: 0, rows: [] });
        if (params.id === 99)
          return ok({ id: params.id, dataType: "buyProxy", host: "127.0.0.99" });
        return ok({
          total: 1,
          rows: [{ id: params.id, dataType: "proxyModule", host: "127.0.0.1" }],
        });
      },
      create: async (params) => {
        calls.push(["proxy.create", params]);
        return ok();
      },
      batchCreate: async (params) => {
        calls.push(["proxy.batchCreate", params]);
        return ok();
      },
      modify: async (params) => {
        calls.push(["proxy.modify", params]);
        return ok();
      },
      delete: async (params) => {
        calls.push(["proxy.delete", params]);
        return ok();
      },
      detect: async (params) => {
        calls.push(["proxy.detect", params]);
        return ok();
      },
      detectChannels: async () => {
        calls.push(["proxy.detectChannels"]);
        return calls.filter((call) => call[0] === "proxy.detectChannels").length > 1
          ? ok([])
          : ok([{ label: "IPRust.io", value: "http://iprust.io/ip.json", type: "url" }]);
      },
    },
    account: {
      list: async (params) => {
        calls.push(["account.list", params]);
        return ok({
          total: 1,
          rows: [
            {
              id: 5,
              platformUrl: "https://example.com",
              platformUserName: "seller",
              platformRemarks: "memo",
            },
          ],
        });
      },
      create: async (params) => {
        calls.push(["account.create", params]);
        return ok({ platform_id: 5 });
      },
      batchCreate: async (params) => {
        calls.push(["account.batchCreate", params]);
        return ok();
      },
      modify: async (params) => {
        calls.push(["account.modify", params]);
        return ok();
      },
      delete: async (params) => {
        calls.push(["account.delete", params]);
        return ok();
      },
    },
  };
  return { api, calls };
}

describe("browser domains", () => {
  test("preserves workspace and project API fields", async () => {
    const { api, calls } = createApiRecorder();
    const workspaces = await new WorkspaceDomain(api).list({ page: 2, pageSize: 10 });
    const projects = await new ProjectDomain(api).list({ page: 1 });

    assert.equal(calls[0][1].page_index, 2);
    assert.equal(workspaces.rows[0].workspaceName, "Main Workspace");
    assert.deepEqual(workspaces.rows[0].project_details, [{ projectId: 3, projectName: "Ops" }]);
    assert.deepEqual(workspaces.rows[1].project_details, [{ id: 4, name: "Fallback Ops" }, {}]);
    assert.deepEqual(projects.rows, [{ id: 4, name: "Fallback Project" }]);
  });

  test("maps profile operations to browser endpoints", async () => {
    const { api, calls } = createApiRecorder();
    const profiles = new ProfileDomain(api);

    const page = await profiles.list({
      page: 1,
      pageSize: 20,
      dirIds: "profile-1,profile-2",
      projectIds: "3,4",
      windowName: "Alpha",
      sortNums: "11",
      os: "Windows",
    });
    const created = await profiles.create({
      windowName: "Created",
      projectId: 3,
      coreType: "Chrome",
      coreVersion: "140",
      os: "Windows",
      osVersion: "11",
      proxyInfo: { moduleId: 9, proxyMethod: "choose" },
      defaultOpenUrl: ["https://example.com"],
      windowPlatformList: [{ platformUrl: "https://example.com", platformUserName: "seller" }],
      custom: true,
    });
    const createdWithResult = await profiles.createWithResult({ windowName: "Reported" });
    await profiles.update("profile-1", { windowName: "Renamed" });
    await profiles.delete("profile-1", { isSoftDelete: false });
    await profiles.delete("profile-2");
    const openedOne = await profiles.open("profile-1", {
      forceOpen: true,
      args: ["--mute-audio"],
      headless: true,
    });
    const openedMany = await profiles.open(["profile-1", "profile-2"]);
    await profiles.close(["profile-1", "profile-2"]);
    const info = await profiles.connectionInfo(["profile-1", "profile-2"]);
    await profiles.connectionInfo();
    await profiles.randomizeFingerprint("profile-1");
    await profiles.clearLocalCache("profile-1", { type: "partial" });
    await profiles.clearLocalCache("profile-2");
    await profiles.clearServerCache(["profile-1"]);

    assert.equal(page.rows[0].dirId, "profile-1");
    assert.equal(created.dirId, "created-profile");
    assert.deepEqual(createdWithResult, { id: "created-profile", message: "ok" });
    assert.equal(openedOne.ws, "ws://profile-1");
    assert.equal(openedMany.length, 2);
    assert.deepEqual(calls.filter((call) => call[0] === "browser.open")[0][1], {
      dirId: "profile-1",
      forceOpen: true,
      args: ["--mute-audio"],
      headless: true,
    });
    assert.deepEqual(calls.filter((call) => call[0] === "browser.open")[1][1], {
      dirId: "profile-1",
    });
    assert.deepEqual(
      calls.filter((call) => call[0] === "browser.close").map((call) => call[1]),
      [{ dirId: "profile-1" }, { dirId: "profile-2" }],
    );
    assert.deepEqual(calls.find((call) => call[0] === "browser.randomEnv")[1], {
      dirId: "profile-1",
    });
    assert.equal(info[0].ws, "ws://profile-1");
    assert.equal(calls.find((call) => call[0] === "browser.list")[1].projectIds, "3,4");
    assert.equal(calls.find((call) => call[0] === "browser.list")[1].dirIds, "profile-1,profile-2");
    assert.equal(calls.find((call) => call[0] === "browser.list")[1].sortNums, "11");
    assert.equal(
      calls.find((call) => call[0] === "browser.create")[1].windowPlatformList[0].platformUserName,
      "seller",
    );
    assert.equal(calls.find((call) => call[0] === "browser.delete")[1].isSoftDelete, false);
    assert.equal(calls.filter((call) => call[0] === "browser.delete")[1][1].isSoftDelete, true);
    assert.deepEqual(
      calls.filter((call) => call[0] === "browser.connectionInfo").map((call) => call[1]),
      [{ dirIds: "profile-1,profile-2" }, {}],
    );
    assert.deepEqual(
      calls.filter((call) => call[0] === "browser.clearLocalCache").map((call) => call[1]),
      [
        { dirIds: ["profile-1"], type: "partial" },
        { dirIds: ["profile-2"], type: "all" },
      ],
    );
    assert.deepEqual(calls.find((call) => call[0] === "browser.clearServerCache")[1], {
      dirIds: ["profile-1"],
    });
  });

  test("reports missing profiles and failed SDK responses clearly", async () => {
    const { api } = createApiRecorder();
    await assert.rejects(new ProfileDomain(api).get("missing"), /Profile not found/);
    assert.throws(() => ensureSuccess({ code: 500, msg: "broken" }), /broken/);
    assert.throws(
      () => ensureSuccess({ code: 500, msg: "" }),
      /Roxy API request failed with code 500/,
    );
    assert.throws(() => unwrapData({ code: 404, msg: "missing" }), /missing/);
    assert.deepEqual(asArray("one"), ["one"]);
    assert.deepEqual(asArray(["one", "two"]), ["one", "two"]);
  });

  test("maps proxy operations through list_merged and proxy source language", async () => {
    const { api, calls } = createApiRecorder();
    const proxies = new ProxyDomain(api);

    const page = await proxies.list({
      page: 1,
      proxyType: "1",
      proxyBindStatus: "0",
      proxyAutoRenew: "0",
      country: "US",
      check_status: 2,
      orderName: "checkTime",
      orderType: "desc",
    });
    const proxy = await proxies.get(12);
    const directProxy = await proxies.get(99);
    await proxies.create({
      checkChannel: "http://iprust.io/ip.json",
      ipType: "IPV4",
      protocol: "SOCKS5",
      host: "127.0.0.1",
      port: "1080",
      proxyUserName: "u",
      proxyPassword: "p",
      remark: "memo",
    });
    const createdWithResult = await proxies.createWithResult({
      checkChannel: "http://iprust.io/ip.json",
      ipType: "IPV4",
      protocol: "HTTP",
      host: "127.0.0.4",
      port: "8082",
    });
    await proxies.createMany({
      checkChannel: "http://iprust.io/ip.json",
      proxyList: [
        {
          ipType: "IPV4",
          protocol: "HTTP",
          host: "127.0.0.2",
          port: "8080",
        },
      ],
    });
    await proxies.update(12, {
      checkChannel: "http://iprust.io/ip.json",
      ipType: "IPV4",
      protocol: "HTTPS",
      host: "127.0.0.3",
      port: "8081",
    });
    await proxies.delete([12]);
    await proxies.detect(12);
    const channels = await proxies.detectChannels();
    const emptyChannels = await proxies.detectChannels();
    await proxies.list({
      proxyType: "0",
      type: "available_list",
      proxyBindStatus: "1",
      proxyAutoRenew: "1",
      check_status: 1,
    });
    await proxies.list({ check_status: 0 });

    assert.equal(page.rows[0].dataType, "buyProxy");
    assert.equal(proxy.dataType, "proxyModule");
    assert.equal(directProxy.dataType, "buyProxy");
    assert.deepEqual(createdWithResult, { message: "ok" });
    assert.deepEqual(calls.find((call) => call[0] === "proxy.detect")[1], { id: 12 });
    assert.equal(channels[0].label, "IPRust.io");
    assert.deepEqual(emptyChannels, []);
    assert.equal(calls.filter((call) => call[0] === "proxy.detectChannels").length, 2);
    assert.equal(calls.find((call) => call[0] === "proxy.listMerged")[1].proxyType, "1");
    assert.equal(calls.find((call) => call[0] === "proxy.listMerged")[1].proxyBindStatus, "0");
    assert.deepEqual(calls.find((call) => call[0] === "proxy.create")[1], {
      checkChannel: "http://iprust.io/ip.json",
      ipType: "IPV4",
      protocol: "SOCKS5",
      host: "127.0.0.1",
      port: "1080",
      proxyUserName: "u",
      proxyPassword: "p",
      remark: "memo",
    });
    assert.deepEqual(calls.find((call) => call[0] === "proxy.batchCreate")[1], {
      checkChannel: "http://iprust.io/ip.json",
      proxyList: [
        {
          ipType: "IPV4",
          protocol: "HTTP",
          host: "127.0.0.2",
          port: "8080",
        },
      ],
    });
    assert.deepEqual(calls.find((call) => call[0] === "proxy.modify")[1], {
      id: 12,
      checkChannel: "http://iprust.io/ip.json",
      ipType: "IPV4",
      protocol: "HTTPS",
      host: "127.0.0.3",
      port: "8081",
    });
    assert.deepEqual(calls.find((call) => call[0] === "proxy.delete")[1], { ids: [12] });
    await assert.rejects(proxies.get(0), /Proxy not found/);
  });

  test("maps platform account CRUD operations", async () => {
    const { api, calls } = createApiRecorder();
    const accounts = new PlatformAccountDomain(api);

    const availablePage = await accounts.listAvailable({
      accountId: 6,
      page: 2,
      pageSize: 5,
    });
    const page = await accounts.list({ page: 1, pageSize: 10 });
    const createdId = await accounts.create({
      platformUrl: "https://example.com",
      platformUserName: "seller",
      platformPassword: "secret",
      platformEfa: "otp",
      platformRemarks: "memo",
    });
    const createdWithResult = await accounts.createWithResult({
      platformUrl: "https://reported.example.com",
    });
    await accounts.createMany([{ platformUrl: "https://example.com", platformUserName: "seller" }]);
    await accounts.update(5, {
      platformUrl: "https://example.com",
      platformRemarks: "new",
    });
    await accounts.delete([5]);

    assert.equal(availablePage.rows[0].platformUserName, "available-seller");
    assert.equal(availablePage.page, 2);
    assert.equal(page.rows[0].platformUserName, "seller");
    assert.equal(createdId, 5);
    assert.deepEqual(createdWithResult, { id: 5, message: "ok" });
    assert.equal(calls.find((call) => call[0] === "account.create")[1].platformEfa, "otp");
    assert.deepEqual(calls.find((call) => call[0] === "browser.accounts")[1], {
      page_index: 2,
      page_size: 5,
      accountId: 6,
    });
    assert.equal(
      calls.find((call) => call[0] === "account.batchCreate")[1].accountList[0].platformUserName,
      "seller",
    );
    assert.deepEqual(calls.find((call) => call[0] === "account.delete")[1], { ids: [5] });
  });
});
