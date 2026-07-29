import assert from "node:assert/strict";
import { describe, test } from "vite-plus/test";
import { CommerceAccountDomain } from "../../../lib/domains/commerce/index.js";

function createProfilesRecorder() {
  const calls = [];
  const profile = {
    dirId: "account-1",
    name: "Amazon Store A",
    raw: { projectId: 3, marker: "profile" },
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
        return { ...profile, dirId: "created-account", name: input.name };
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
  test("renames browser profile workflows into ecommerce account workflows", async () => {
    const { profiles, calls } = createProfilesRecorder();
    const accounts = new CommerceAccountDomain(profiles);

    const page = await accounts.list({ page: 2, pageSize: 10, keyword: "Amazon", projectIds: [3] });
    const account = await accounts.get("account-1");
    const created = await accounts.create({
      name: "Amazon Store B",
      projectId: 3,
      proxyId: 9,
      platform: {
        url: "https://sellercentral.amazon.com",
        username: "seller@example.com",
        password: "secret",
        twoFactorKey: "otp",
        remarks: "memo",
      },
      raw: { custom: true },
    });
    const createdWithUrls = await accounts.create({
      name: "Amazon Store C",
      urls: ["https://example.com/start"],
    });
    await accounts.update("account-1", { name: "Renamed", urls: ["https://example.com"] });
    const opened = await accounts.open("account-1", { force: true, args: ["--mute-audio"] });
    await accounts.close("account-1");
    await accounts.delete(["account-1"], { soft: false });

    assert.equal(page.rows[0].projectId, 3);
    assert.equal(account.name, "Amazon Store A");
    assert.equal(created.id, "created-account");
    assert.equal(createdWithUrls.name, "Amazon Store C");
    assert.equal(opened.ws, "ws://account-1");
    assert.deepEqual(calls[0][1], { page: 2, pageSize: 10, name: "Amazon", projectIds: [3] });
    assert.equal(
      calls.find((call) => call[0] === "create")[1].platformAccounts[0].platformUrl,
      "https://sellercentral.amazon.com",
    );
    assert.deepEqual(calls.filter((call) => call[0] === "create")[1][1].urls, [
      "https://example.com/start",
    ]);
    assert.equal(calls.filter((call) => call[0] === "create")[1][1].platformAccounts, undefined);
    assert.equal(calls.find((call) => call[0] === "update")[2].urls[0], "https://example.com");
    assert.deepEqual(calls.find((call) => call[0] === "delete")[2], { soft: false });
  });
});
