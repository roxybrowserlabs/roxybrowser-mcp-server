import assert from "node:assert/strict";
import { describe, test } from "vite-plus/test";
import {
  parseCliValue,
  runApiDebugCommand,
  runSdkDebugCommand,
} from "../../lib/cli/debug.js";
import { runBrowserCli } from "../../lib/cli/browser.js";
import { ROXY_OPENAPI_VERSION } from "../../lib/index.js";
import { createJsonResponse, installFetchMock } from "../../support/helpers.mjs";

function installRecorder(body = { code: 0, msg: "ok", data: { total: 0, rows: [] } }) {
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

describe("debug CLI helpers", () => {
  test("parses JSON values and leaves plain strings unchanged", () => {
    assert.deepEqual(parseCliValue('{"page":1}'), { page: 1 });
    assert.deepEqual(parseCliValue("[1,2]"), [1, 2]);
    assert.equal(parseCliValue("true"), true);
    assert.equal(parseCliValue("profile-1"), "profile-1");
  });

  test("calls browser SDK operations with parsed positional arguments", async () => {
    const { calls, restoreFetch } = installRecorder({
      code: 0,
      msg: "ok",
      data: { dirId: "profile-1", ws: "ws://127.0.0.1/devtools/browser/1" },
    });
    try {
      const result = await runSdkDebugCommand("profiles.open", ["profile-1", '{"forceOpen":true}'], {
        mode: "browser",
        roxy: { apiKey: "secret-token", workspaceId: 77 },
      });

      assert.equal(calls[0].url.pathname, "/browser/open");
      assert.deepEqual(calls[0].body, {
        dirId: "profile-1",
        forceOpen: true,
        workspaceId: 77,
      });
      assert.equal(result.dirId, "profile-1");
    } finally {
      restoreFetch();
    }
  });

  test("keeps commerce SDK debug mode as an empty shell", async () => {
    await assert.rejects(
      runSdkDebugCommand("accounts.open", ["account-1"], {
        mode: "commerce",
        roxy: { apiKey: "secret-token", workspaceId: 88 },
      }),
      /Unknown SDK operation/,
    );
  });

  test("calls raw endpoints that are not modeled by the SDK", async () => {
    const { calls, restoreFetch } = installRecorder({
      code: 0,
      msg: "ok",
      data: { enabled: true },
    });
    try {
      const result = await runApiDebugCommand(
        "POST",
        "/browser/new_feature",
        '{"dirId":"profile-1"}',
        { apiKey: "secret-token", workspaceId: 99 },
      );

      assert.equal(calls[0].url.pathname, "/browser/new_feature");
      assert.equal(calls[0].options.method, "POST");
      assert.deepEqual(calls[0].body, { dirId: "profile-1", workspaceId: 99 });
      assert.deepEqual(result, { code: 0, msg: "ok", data: { enabled: true } });
    } finally {
      restoreFetch();
    }
  });

  test("supports GET raw endpoints without workspace injection", async () => {
    const { calls, restoreFetch } = installRecorder();
    try {
      await runApiDebugCommand("GET", "/custom/list", '{"page_index":1}', {
        apiKey: "secret-token",
        workspaceId: 99,
      }, {
        injectWorkspace: false,
      });

      assert.equal(calls[0].url.toString(), "http://127.0.0.1:50000/custom/list?page_index=1");
      assert.equal(calls[0].options.method, "GET");
    } finally {
      restoreFetch();
    }
  });

  test("rejects unsafe or unknown SDK operation paths", async () => {
    await assert.rejects(
      runSdkDebugCommand("__proto__.toString", [], {
        mode: "browser",
        roxy: { apiKey: "secret-token" },
      }),
      /Invalid SDK operation path/,
    );
    await assert.rejects(
      runSdkDebugCommand("profiles.missing", [], {
        mode: "browser",
        roxy: { apiKey: "secret-token" },
      }),
      /Unknown SDK operation/,
    );
  });

  test("parses connection options after the sdk subcommand", async () => {
    const { calls, restoreFetch } = installRecorder();
    const originalLog = console.log;
    const output = [];
    console.log = (value) => {
      output.push(value);
    };
    try {
      await runBrowserCli([
        "node",
        "roxybrowser-openapi-mcp",
        "sdk",
        "profiles.list",
        '{"page":1}',
        "--api-key",
        "secret-token",
        "--api-host",
        "http://127.0.0.1:50000",
        "--workspace-id",
        "123",
      ]);

      assert.equal(calls[0].url.pathname, "/browser/list_v3");
      assert.equal(calls[0].url.searchParams.get("page_index"), "1");
      assert.equal(calls[0].url.searchParams.get("workspaceId"), "123");
      assert.equal(calls[0].options.headers.token, "secret-token");
      assert.match(output[0], /"rows": \[\]/);
    } finally {
      console.log = originalLog;
      restoreFetch();
    }
  });

  test("prints version and operation support from the CLI", async () => {
    const originalLog = console.log;
    const output = [];
    console.log = (value) => {
      output.push(JSON.parse(value));
    };
    try {
      await runBrowserCli(["node", "roxybrowser-openapi-mcp", "version"]);
      await runBrowserCli([
        "node",
        "roxybrowser-openapi-mcp",
        "supports",
        "browser.profile.open",
        "3.0.0",
      ]);

      assert.deepEqual(output[0], { packageVersion: ROXY_OPENAPI_VERSION });
      assert.equal(output[1].operationId, "browser.profile.open");
      assert.equal(output[1].roxyBrowserVersion, "3.0.0");
      assert.equal(output[1].supported, true);
      assert.equal("sinceRoxyBrowserVersion" in output[1].capability, false);
    } finally {
      console.log = originalLog;
    }
  });
});
