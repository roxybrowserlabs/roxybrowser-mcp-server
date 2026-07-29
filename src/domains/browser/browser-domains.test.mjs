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
        return ok({ id: params.id, host: "127.0.0.1" });
      },
      detectChannels: async () => {
        calls.push(["proxy.detectChannels"]);
        return calls.filter((call) => call[0] === "proxy.detectChannels").length > 1
          ? { code: 0, msg: "ok" }
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
  test("maps workspaces and projects into SDK names", async () => {
    const { api, calls } = createApiRecorder();
    const workspaces = await new WorkspaceDomain(api).list({ page: 2, pageSize: 10 });
    const projects = await new ProjectDomain(api).list({ page: 1 });

    assert.equal(calls[0][1].page_index, 2);
    assert.equal(workspaces.rows[0].name, "Main Workspace");
    assert.deepEqual(workspaces.rows[0].projects, [{ id: 3, name: "Ops" }]);
    assert.deepEqual(workspaces.rows[1].projects, [
      { id: 4, name: "Fallback Ops" },
      { id: 0, name: "" },
    ]);
    assert.deepEqual(projects.rows, [{ id: 4, name: "Fallback Project" }]);
  });

  test("maps profile operations to browser endpoints", async () => {
    const { api, calls } = createApiRecorder();
    const profiles = new ProfileDomain(api);

    const page = await profiles.list({
      page: 1,
      pageSize: 20,
      projectIds: [3, 4],
      name: "Alpha",
      serialNumber: "11",
      os: "Windows",
    });
    const created = await profiles.create({
      name: "Created",
      projectId: 3,
      core: { type: "Chrome", version: "140" },
      os: { name: "Windows", version: "11" },
      proxyId: 9,
      urls: ["https://example.com"],
      platformAccounts: [{ platformUrl: "https://example.com", username: "seller" }],
      raw: { custom: true },
    });
    await profiles.update("profile-1", { name: "Renamed" });
    await profiles.delete("profile-1", { soft: false });
    const openedOne = await profiles.open("profile-1", {
      force: true,
      args: ["--mute-audio"],
      headless: true,
    });
    const openedMany = await profiles.open(["profile-1", "profile-2"]);
    await profiles.close(["profile-1", "profile-2"]);
    const info = await profiles.connectionInfo(["profile-1"]);
    await profiles.randomizeFingerprint("profile-1");
    await profiles.clearLocalCache("profile-1", { type: "cookie" });
    await profiles.clearServerCache(["profile-1"]);

    assert.equal(page.rows[0].id, "profile-1");
    assert.equal(created.id, "created-profile");
    assert.equal(openedOne.ws, "ws://profile-1");
    assert.equal(openedMany.length, 2);
    assert.equal(info[0].ws, "ws://profile-1");
    assert.equal(calls.find((call) => call[0] === "browser.list")[1].projectIds, "3,4");
    assert.equal(
      calls.find((call) => call[0] === "browser.create")[1].windowPlatformList[0].platformUserName,
      "seller",
    );
    assert.equal(calls.find((call) => call[0] === "browser.delete")[1].isSoftDelete, false);
    assert.deepEqual(calls.find((call) => call[0] === "browser.connectionInfo")[1], {
      dirIds: "profile-1",
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
      source: "store",
      type: "all",
      bindStatus: "unbound",
      autoRenew: false,
      country: "US",
      checkStatus: "failed",
      sortBy: "checkTime",
      sortOrder: "desc",
    });
    const proxy = await proxies.get(12);
    const directProxy = await proxies.get(99);
    await proxies.create({
      protocol: "SOCKS5",
      host: "127.0.0.1",
      port: "1080",
      username: "u",
      password: "p",
      remark: "memo",
    });
    await proxies.createMany([{ protocol: "HTTP", host: "127.0.0.2", port: "8080" }]);
    await proxies.update(12, { protocol: "HTTPS", host: "127.0.0.3", port: "8081" });
    await proxies.delete([12]);
    const detected = await proxies.detect(12);
    const channels = await proxies.detectChannels();
    const emptyChannels = await proxies.detectChannels();
    await proxies.list({
      source: "user",
      type: "available",
      bindStatus: "bound",
      autoRenew: true,
      checkStatus: "passed",
    });
    await proxies.list({ source: "all", bindStatus: "all", checkStatus: "unknown" });

    assert.equal(page.rows[0].source, "store");
    assert.equal(proxy.source, "user");
    assert.equal(directProxy.source, "store");
    assert.equal(detected.id, 12);
    assert.equal(channels[0].label, "IPRust.io");
    assert.deepEqual(emptyChannels, []);
    assert.equal(calls.find((call) => call[0] === "proxy.listMerged")[1].proxyType, "1");
    assert.equal(calls.find((call) => call[0] === "proxy.listMerged")[1].proxyBindStatus, "0");
    assert.equal(calls.find((call) => call[0] === "proxy.modify")[1].proxyCategory, "HTTPS");
    await assert.rejects(proxies.get(0), /Proxy not found/);
  });

  test("maps platform account CRUD operations", async () => {
    const { api, calls } = createApiRecorder();
    const accounts = new PlatformAccountDomain(api);

    const page = await accounts.list({ page: 1, pageSize: 10 });
    const createdId = await accounts.create({
      platformUrl: "https://example.com",
      username: "seller",
      password: "secret",
      twoFactorKey: "otp",
      remarks: "memo",
    });
    await accounts.createMany([{ platformUrl: "https://example.com", username: "seller" }]);
    await accounts.update(5, { remarks: "new" });
    await accounts.delete([5]);

    assert.equal(page.rows[0].username, "seller");
    assert.equal(createdId, 5);
    assert.equal(calls.find((call) => call[0] === "account.create")[1].platformEfa, "otp");
    assert.equal(
      calls.find((call) => call[0] === "account.batchCreate")[1].accountList[0].platformUserName,
      "seller",
    );
  });
});
