import assert from "node:assert/strict";
import { describe, test } from "vite-plus/test";
import { RoxyBrowserClient } from "../../lib/index.js";
import { createJsonResponse, installFetchMock } from "../../support/helpers.mjs";

function createClient(calls) {
  return new RoxyBrowserClient({
    apiKey: "secret-token",
    baseUrl: "http://127.0.0.1:50000",
    workspaceId: 77,
    fetch: async (url, options) => {
      calls.push({
        url: new URL(url),
        options,
        body: options.body ? JSON.parse(options.body) : undefined,
      });
      if (url.includes("/browser/detail")) {
        return createJsonResponse({
          code: 0,
          msg: "ok",
          data: {
            total: 1,
            rows: [
              {
                dirId: "profile-1",
                windowName: "Alpha",
                coreType: "Chrome",
                coreVersion: "140",
                os: "Windows",
                osVersion: "11",
              },
            ],
          },
        });
      }
      if (url.includes("/browser/create")) {
        return createJsonResponse({ code: 0, msg: "ok", data: { dirId: "profile-1" } });
      }
      return createJsonResponse({
        code: 0,
        msg: "ok",
        data: {
          total: 1,
          rows: [
            {
              dirId: "profile-1",
              windowName: "Alpha",
              coreType: "Chrome",
              coreVersion: "140",
              os: "Windows",
              osVersion: "11",
            },
          ],
        },
      });
    },
  });
}

describe("RoxyBrowserClient", () => {
  test("passes API profile fields through the browser SDK", async () => {
    const calls = [];
    const client = createClient(calls);

    const page = await client.profiles.list({
      page: 2,
      pageSize: 10,
      dirIds: "profile-1",
      projectIds: "1,2",
      windowName: "Alpha",
    });

    assert.equal(calls[0].url.pathname, "/browser/list_v3");
    assert.equal(calls[0].url.searchParams.get("page_index"), "2");
    assert.equal(calls[0].url.searchParams.get("page_size"), "10");
    assert.equal(calls[0].url.searchParams.get("dirIds"), "profile-1");
    assert.equal(calls[0].url.searchParams.get("projectIds"), "1,2");
    assert.equal(calls[0].url.searchParams.get("windowName"), "Alpha");
    assert.equal(page.rows[0].dirId, "profile-1");
    assert.equal(page.rows[0].windowName, "Alpha");
  });

  test("creates profiles with API-shaped input", async () => {
    const calls = [];
    const client = createClient(calls);

    const profile = await client.profiles.create({
      windowName: "Alpha",
      projectId: 3,
      coreType: "Chrome",
      coreVersion: "140",
      os: "Windows",
      osVersion: "11",
      proxyInfo: { moduleId: 9, proxyMethod: "choose" },
      defaultOpenUrl: ["https://example.com"],
    });

    assert.equal(calls[0].url.pathname, "/browser/create");
    assert.equal(calls[0].body.windowName, "Alpha");
    assert.equal(calls[0].body.projectId, 3);
    assert.deepEqual(calls[0].body.proxyInfo, { moduleId: 9, proxyMethod: "choose" });
    assert.equal(calls[1].url.pathname, "/browser/detail");
    assert.equal(profile.dirId, "profile-1");
  });

  test("passes API proxy filters to list_merged", async () => {
    const calls = [];
    const restoreFetch = installFetchMock(async (url, options) => {
      calls.push({ url: new URL(url), options });
      return createJsonResponse({ code: 0, msg: "ok", data: { total: 0, rows: [] } });
    });
    try {
      const client = new RoxyBrowserClient({ apiKey: "secret-token", workspaceId: 77 });
      await client.proxies.list({
        proxyType: "0",
        type: "available_list",
        proxyBindStatus: "1",
        proxyAutoRenew: "1",
        orderName: "lastCountry",
        orderType: "asc",
      });

      assert.equal(calls[0].url.pathname, "/proxy/list_merged");
      assert.equal(calls[0].url.searchParams.get("proxyType"), "0");
      assert.equal(calls[0].url.searchParams.get("type"), "available_list");
      assert.equal(calls[0].url.searchParams.get("proxyBindStatus"), "1");
      assert.equal(calls[0].url.searchParams.get("proxyAutoRenew"), "1");
      assert.equal(calls[0].url.searchParams.get("orderName"), "lastCountry");
    } finally {
      restoreFetch();
    }
  });

  test("exposes labels and propagates label errors", async () => {
    const successCalls = [];
    const success = new RoxyBrowserClient({
      apiKey: "secret-token",
      workspaceId: 77,
      fetch: async (url, options) => {
        successCalls.push({ url: new URL(url), options });
        return createJsonResponse({
          code: 0,
          msg: "ok",
          data: [{ id: 1, name: "VIP", color: "#ff0000" }],
        });
      },
    });

    const labels = await success.labels.list();
    assert.equal(successCalls[0].url.pathname, "/browser/label");
    assert.equal(labels[0].name, "VIP");

    const failure = new RoxyBrowserClient({
      apiKey: "secret-token",
      fetch: async () => createJsonResponse({ code: 500, msg: "label failed" }),
    });
    await assert.rejects(failure.labels.list(), /label failed/);
  });
});
