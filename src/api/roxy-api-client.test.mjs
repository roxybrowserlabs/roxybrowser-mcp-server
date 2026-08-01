import assert from "node:assert/strict";
import { describe, test } from "vite-plus/test";
import { RoxyApiClient, RoxyApiConfigError, RoxyApiHttpError } from "../../lib/index.js";
import { appendQuery, withDefaultWorkspace } from "../../lib/api/transport.js";
import { toPage, toPageRequest } from "../../lib/sdk/shared/pagination.js";
import { unwrapData } from "../../lib/sdk/shared/result.js";
import { createJsonResponse, installFetchMock } from "../../support/helpers.mjs";

function installRecorder(body = { code: 0, msg: "success", data: {} }) {
  const calls = [];
  const restoreFetch = installFetchMock(async (url, options) => {
    calls.push({
      url: new URL(url),
      options,
      body: options.body ? JSON.parse(options.body) : undefined,
    });
    return createJsonResponse(body);
  });
  return { calls, restoreFetch };
}

describe("RoxyApiClient", () => {
  test("sends token headers and default workspaceId on GET requests", async () => {
    const { calls, restoreFetch } = installRecorder({
      code: 0,
      msg: "ok",
      data: { total: 0, rows: [] },
    });
    try {
      const api = new RoxyApiClient({
        apiKey: "secret-token",
        baseUrl: "http://127.0.0.1:50000/",
        workspaceId: 19744,
      });

      await api.browser.list({ windowName: "alpha", page_index: 2 });

      assert.equal(
        calls[0].url.toString(),
        "http://127.0.0.1:50000/browser/list_v3?windowName=alpha&page_index=2&workspaceId=19744",
      );
      assert.equal(calls[0].options.method, "GET");
      assert.equal(calls[0].options.headers.token, "secret-token");
    } finally {
      restoreFetch();
    }
  });

  test("sends JSON bodies on POST requests", async () => {
    const { calls, restoreFetch } = installRecorder({
      code: 0,
      msg: "ok",
      data: { dirId: "profile-1" },
    });
    try {
      const api = new RoxyApiClient({ apiKey: "secret-token", workspaceId: 7 });
      await api.browser.create({ windowName: "alpha" });

      assert.equal(calls[0].url.pathname, "/browser/create");
      assert.equal(calls[0].options.method, "POST");
      assert.deepEqual(calls[0].body, { windowName: "alpha", workspaceId: 7 });
    } finally {
      restoreFetch();
    }
  });

  test("throws typed config and HTTP errors", async () => {
    await assert.rejects(new RoxyApiClient().health(), (error) => {
      assert.ok(error instanceof RoxyApiConfigError);
      assert.match(error.message, /API key is required/);
      return true;
    });

    const restoreFetch = installFetchMock(async () =>
      createJsonResponse(
        { error: "bad request" },
        { ok: false, status: 400, statusText: "Bad Request" },
      ),
    );
    try {
      await assert.rejects(new RoxyApiClient({ apiKey: "secret-token" }).health(), (error) => {
        assert.ok(error instanceof RoxyApiHttpError);
        assert.equal(error.status, 400);
        assert.match(error.message, /HTTP 400: Bad Request/);
        return true;
      });
    } finally {
      restoreFetch();
    }
  });

  test("covers the 3.0 raw endpoint surface with default workspace injection", async () => {
    const { calls, restoreFetch } = installRecorder({
      code: 0,
      msg: "ok",
      data: { total: 0, rows: [], dirId: "profile-1", platform_id: 9 },
    });
    try {
      const api = new RoxyApiClient({ apiKey: "secret-token", workspaceId: 19744 });

      await api.workspace.list({ page_index: 1 });
      await api.workspace.projects({ page_index: 1 });
      await api.browser.detail({ dirId: "profile-1" });
      await api.browser.modify({ dirId: "profile-1", windowName: "Alpha" });
      await api.browser.open({ dirId: "profile-1", forceOpen: true });
      await api.browser.close({ dirId: "profile-1" });
      await api.browser.delete({ dirIds: ["profile-1"] });
      await api.browser.clearLocalCache({ dirIds: ["profile-1"], type: "cloud" });
      await api.browser.clearServerCache({ dirIds: ["profile-1"] });
      await api.browser.randomEnv({ dirId: "profile-1" });
      await api.browser.connectionInfo({ dirIds: "profile-1" });
      await api.browser.labels({});
      await api.browser.accounts({ page_index: 1 });
      await api.proxy.detectChannels();
      await api.proxy.list({ page_index: 1 });
      await api.proxy.listMerged({ page_index: 1 });
      await api.proxy.detail({ id: 1 });
      await api.proxy.create({
        checkChannel: "http://iprust.io/ip.json",
        ipType: "IPV4",
        protocol: "SOCKS5",
        host: "127.0.0.1",
        port: "1080",
      });
      await api.proxy.batchCreate({
        checkChannel: "http://iprust.io/ip.json",
        proxyList: [
          {
            ipType: "IPV4",
            protocol: "HTTP",
            host: "127.0.0.1",
            port: "8080",
          },
        ],
      });
      await api.proxy.detect({ id: 1 });
      await api.proxy.modify({
        id: 1,
        checkChannel: "http://iprust.io/ip.json",
        ipType: "IPV4",
        protocol: "HTTPS",
        host: "127.0.0.2",
        port: "8443",
        remark: "new",
      });
      await api.proxy.delete({ ids: [1] });
      await api.proxy.boughtList({ page_index: 2, page_size: 15, type: 1 });
      await api.account.list({ page_index: 1 });
      await api.account.create({ platformUrl: "https://example.com" });
      await api.account.batchCreate({ accountList: [{ platformUrl: "https://example.com" }] });
      await api.account.modify({
        id: 9,
        platformUrl: "https://example.com",
        platformUserName: "user",
      });
      await api.account.delete({ ids: [9] });

      const byPath = calls.map((call) => call.url.pathname);
      assert.deepEqual(byPath, [
        "/browser/workspace",
        "/project/list",
        "/browser/detail",
        "/browser/mdf",
        "/browser/open",
        "/browser/close",
        "/browser/delete",
        "/browser/clear_local_cache",
        "/browser/clear_server_cache",
        "/browser/random_env",
        "/browser/connection_info",
        "/browser/label",
        "/browser/account",
        "/proxy/detect_channel",
        "/proxy/list",
        "/proxy/list_merged",
        "/proxy/detail",
        "/proxy/create",
        "/proxy/batch_create",
        "/proxy/detect",
        "/proxy/modify",
        "/proxy/delete",
        "/proxy/bought_list",
        "/account/list",
        "/account/create",
        "/account/batch_create",
        "/account/modify",
        "/account/delete",
      ]);
      assert.deepEqual(calls.find((call) => call.url.pathname === "/proxy/create").body, {
        checkChannel: "http://iprust.io/ip.json",
        ipType: "IPV4",
        protocol: "SOCKS5",
        host: "127.0.0.1",
        port: "1080",
        workspaceId: 19744,
      });
      assert.deepEqual(calls.find((call) => call.url.pathname === "/proxy/batch_create").body, {
        checkChannel: "http://iprust.io/ip.json",
        proxyList: [
          {
            ipType: "IPV4",
            protocol: "HTTP",
            host: "127.0.0.1",
            port: "8080",
          },
        ],
        workspaceId: 19744,
      });
      assert.deepEqual(calls.find((call) => call.url.pathname === "/proxy/detect").body, {
        id: 1,
        workspaceId: 19744,
      });
      assert.deepEqual(calls.find((call) => call.url.pathname === "/proxy/modify").body, {
        id: 1,
        checkChannel: "http://iprust.io/ip.json",
        ipType: "IPV4",
        protocol: "HTTPS",
        host: "127.0.0.2",
        port: "8443",
        remark: "new",
        workspaceId: 19744,
      });
      assert.deepEqual(calls.find((call) => call.url.pathname === "/proxy/delete").body, {
        ids: [1],
        workspaceId: 19744,
      });
      assert.deepEqual(calls.find((call) => call.url.pathname === "/account/create").body, {
        platformUrl: "https://example.com",
        workspaceId: 19744,
      });
      assert.deepEqual(calls.find((call) => call.url.pathname === "/account/batch_create").body, {
        accountList: [{ platformUrl: "https://example.com" }],
        workspaceId: 19744,
      });
      assert.deepEqual(calls.find((call) => call.url.pathname === "/account/modify").body, {
        id: 9,
        platformUrl: "https://example.com",
        platformUserName: "user",
        workspaceId: 19744,
      });
      assert.deepEqual(calls.find((call) => call.url.pathname === "/account/delete").body, {
        ids: [9],
        workspaceId: 19744,
      });
      const boughtListQuery = calls.find((call) => call.url.pathname === "/proxy/bought_list").url
        .searchParams;
      assert.equal(boughtListQuery.get("workspaceId"), "19744");
      assert.equal(boughtListQuery.get("page_index"), "2");
      assert.equal(boughtListQuery.get("page_size"), "15");
      assert.equal(boughtListQuery.get("type"), "1");
      assert.deepEqual(
        calls.find((call) => call.url.pathname === "/browser/clear_local_cache").body,
        { dirIds: ["profile-1"], type: "cloud", workspaceId: 19744 },
      );
      assert.deepEqual(
        calls.find((call) => call.url.pathname === "/browser/clear_server_cache").body,
        { dirIds: ["profile-1"], workspaceId: 19744 },
      );
      assert.equal(
        calls
          .find((call) => call.url.pathname === "/proxy/list")
          .url.searchParams.get("workspaceId"),
        "19744",
      );
      assert.equal(
        calls
          .find((call) => call.url.pathname === "/proxy/detect_channel")
          .url.searchParams.get("workspaceId"),
        "19744",
      );
      assert.equal(
        calls
          .find((call) => call.url.pathname === "/browser/connection_info")
          .url.searchParams.get("dirIds"),
        "profile-1",
      );
      assert.equal(
        calls
          .find((call) => call.url.pathname === "/project/list")
          .url.searchParams.get("workspaceId"),
        "19744",
      );
      assert.equal(
        calls
          .find((call) => call.url.pathname === "/browser/account")
          .url.searchParams.get("workspaceId"),
        "19744",
      );
      assert.equal(
        calls
          .find((call) => call.url.pathname === "/account/list")
          .url.searchParams.get("workspaceId"),
        "19744",
      );
      assert.equal(
        calls
          .find((call) => call.url.pathname === "/browser/label")
          .url.searchParams.get("workspaceId"),
        "19744",
      );
      assert.deepEqual(calls.find((call) => call.url.pathname === "/browser/close").body, {
        dirId: "profile-1",
      });
      assert.deepEqual(calls.find((call) => call.url.pathname === "/browser/open").body, {
        dirId: "profile-1",
        forceOpen: true,
        workspaceId: 19744,
      });
      assert.deepEqual(calls.find((call) => call.url.pathname === "/browser/random_env").body, {
        dirId: "profile-1",
        workspaceId: 19744,
      });
    } finally {
      restoreFetch();
    }
  });

  test("normalizes query params and workspace defaults without mutating API intent", () => {
    const url = new URL("http://127.0.0.1:50000/browser/list_v3");
    appendQuery(url);
    appendQuery(url, { ids: [1, 2], empty: undefined, none: null, name: "Alpha" });

    assert.equal(url.searchParams.get("ids"), "1,2");
    assert.equal(url.searchParams.get("name"), "Alpha");
    assert.equal(url.searchParams.has("empty"), false);
    assert.deepEqual(withDefaultWorkspace({ workspaceId: 9, name: "Alpha" }, 77), {
      workspaceId: 9,
      name: "Alpha",
    });
    assert.deepEqual(withDefaultWorkspace({ workspaceId: null, name: "Alpha" }, 77), {
      workspaceId: 77,
      name: "Alpha",
    });
    assert.deepEqual(toPageRequest(), { page_index: undefined, page_size: undefined });
    assert.deepEqual(toPage(undefined), { total: 0, rows: [], page: 1, pageSize: 15 });
    assert.throws(
      () => unwrapData({ code: 500, msg: "" }),
      /Roxy API request failed with code 500/,
    );
  });
});
