import assert from "node:assert/strict";
import { describe, test } from "vite-plus/test";
import { CommerceAccountDomain } from "../../../lib/domains/commerce/index.js";

function createProfilesRecorder() {
  const calls = [];
  const profile = {
    dirId: "account-1",
    windowName: "Amazon Store A",
    projectId: 3,
    marker: "profile",
  };
  return {
    calls,
    profiles: {
      list: async (params) => {
        calls.push(["list", params]);
        return {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
          total: 1,
          rows: [profile],
        };
      },
      get: async (dirId) => {
        calls.push(["get", dirId]);
        return { ...profile, dirId };
      },
      create: async (input) => {
        calls.push(["create", input]);
        return { ...profile, dirId: "created-account", windowName: input.windowName };
      },
      update: async (id, patch) => {
        calls.push(["update", id, patch]);
      },
      open: async (id, options) => {
        calls.push(["open", id, options]);
        return { dirId: id, ws: `ws://${id}`, http: `http://${id}` };
      },
      close: async (id) => {
        calls.push(["close", id]);
      },
      delete: async (ids, options) => {
        calls.push(["delete", ids, options]);
      },
    },
  };
}

describe("CommerceAccountDomain", () => {
  test("uses account operations without renaming API fields", async () => {
    const { profiles, calls } = createProfilesRecorder();
    const accounts = new CommerceAccountDomain(profiles);

    const page = await accounts.list({
      page: 2,
      pageSize: 10,
      windowName: "Amazon",
      projectIds: "3",
    });
    const account = await accounts.get("account-1");
    const created = await accounts.create({
      windowName: "Amazon Store B",
      projectId: 3,
      proxyInfo: { moduleId: 9, proxyMethod: "choose" },
      windowPlatformList: [
        {
          platformUrl: "https://sellercentral.amazon.com",
          platformUserName: "seller@example.com",
          platformPassword: "secret",
          platformEfa: "otp",
          platformRemarks: "memo",
        },
      ],
      custom: true,
    });
    const createdWithUrls = await accounts.create({
      windowName: "Amazon Store C",
      defaultOpenUrl: ["https://example.com/start"],
    });
    await accounts.update("account-1", {
      windowName: "Renamed",
      defaultOpenUrl: ["https://example.com"],
    });
    const opened = await accounts.open("account-1", {
      forceOpen: true,
      args: ["--mute-audio"],
    });
    await accounts.close("account-1");
    await accounts.delete(["account-1"], { isSoftDelete: false });

    assert.equal(page.rows[0].projectId, 3);
    assert.equal(account.windowName, "Amazon Store A");
    assert.equal(created.dirId, "created-account");
    assert.equal(createdWithUrls.windowName, "Amazon Store C");
    assert.equal(opened.ws, "ws://account-1");
    assert.deepEqual(calls[0][1], {
      page: 2,
      pageSize: 10,
      windowName: "Amazon",
      projectIds: "3",
    });
    assert.equal(
      calls.find((call) => call[0] === "create")[1].windowPlatformList[0].platformUrl,
      "https://sellercentral.amazon.com",
    );
    assert.deepEqual(calls.filter((call) => call[0] === "create")[1][1].defaultOpenUrl, [
      "https://example.com/start",
    ]);
    assert.equal(calls.filter((call) => call[0] === "create")[1][1].windowPlatformList, undefined);
    assert.equal(
      calls.find((call) => call[0] === "update")[2].defaultOpenUrl[0],
      "https://example.com",
    );
    assert.deepEqual(calls.find((call) => call[0] === "delete")[2], {
      isSoftDelete: false,
    });
  });
});
