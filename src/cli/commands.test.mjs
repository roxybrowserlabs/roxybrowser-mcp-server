import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "vite-plus/test";
import {
  parseCliValue,
  runApiCommand,
  runSdkCommand,
  runToolCommand,
} from "../../lib/cli/commands.js";
import { loadCodexOAuthOptions, resolveRoxyOptions } from "../../lib/cli/options.js";
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

describe("CLI commands", () => {
  test("loads connection defaults from codex oauth state", () => {
    const directory = mkdtempSync(join(tmpdir(), "roxy-cli-"));
    const filePath = join(directory, "codex-oauth.json");
    writeFileSync(
      filePath,
      JSON.stringify({
        apiKey: "oauth-token",
        apiHost: "http://oauth-host",
        workspaceId: "42",
        timeout: "1234",
      }),
    );

    assert.deepEqual(loadCodexOAuthOptions(filePath), {
      apiKey: "oauth-token",
      apiHost: "http://oauth-host",
      workspaceId: 42,
      timeout: 1234,
    });
  });

  test("uses codex oauth state when connection environment variables are unset", () => {
    const directory = mkdtempSync(join(tmpdir(), "roxy-cli-"));
    const filePath = join(directory, "codex-oauth.json");
    writeFileSync(
      filePath,
      JSON.stringify({
        apiKey: "oauth-token",
        apiHost: "http://oauth-host",
        workspaceId: "42",
        timeout: "1234",
      }),
    );

    const original = {
      configPath: process.env.ROXY_CODEX_CONFIG_PATH,
      apiKey: process.env.ROXY_API_KEY,
      apiHost: process.env.ROXY_API_HOST,
      workspaceId: process.env.ROXY_WORKSPACE_ID,
      timeout: process.env.ROXY_TIMEOUT,
    };
    process.env.ROXY_CODEX_CONFIG_PATH = filePath;
    delete process.env.ROXY_API_KEY;
    delete process.env.ROXY_API_HOST;
    delete process.env.ROXY_WORKSPACE_ID;
    delete process.env.ROXY_TIMEOUT;
    try {
      assert.deepEqual(resolveRoxyOptions({}), {
        apiKey: "oauth-token",
        apiHost: "http://oauth-host",
        workspaceId: 42,
        timeout: 1234,
      });
    } finally {
      for (const [key, value] of Object.entries({
        ROXY_CODEX_CONFIG_PATH: original.configPath,
        ROXY_API_KEY: original.apiKey,
        ROXY_API_HOST: original.apiHost,
        ROXY_WORKSPACE_ID: original.workspaceId,
        ROXY_TIMEOUT: original.timeout,
      })) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  });

  test("prefers explicit CLI values over environment and oauth state", () => {
    const original = {
      apiKey: process.env.ROXY_API_KEY,
      apiHost: process.env.ROXY_API_HOST,
      workspaceId: process.env.ROXY_WORKSPACE_ID,
      timeout: process.env.ROXY_TIMEOUT,
    };
    process.env.ROXY_API_KEY = "environment-token";
    process.env.ROXY_API_HOST = "http://environment-host";
    process.env.ROXY_WORKSPACE_ID = "20";
    process.env.ROXY_TIMEOUT = "2000";
    try {
      const resolved = resolveRoxyOptions({
        apiKey: "cli-token",
        apiHost: "http://cli-host",
        workspaceId: 10,
        timeout: 1000,
      });
      assert.deepEqual(resolved, {
        apiKey: "cli-token",
        apiHost: "http://cli-host",
        workspaceId: 10,
        timeout: 1000,
      });
    } finally {
      for (const [key, value] of Object.entries({
        ROXY_API_KEY: original.apiKey,
        ROXY_API_HOST: original.apiHost,
        ROXY_WORKSPACE_ID: original.workspaceId,
        ROXY_TIMEOUT: original.timeout,
      })) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  });

  test("falls back when command options are undefined", () => {
    const original = {
      apiKey: process.env.ROXY_API_KEY,
      apiHost: process.env.ROXY_API_HOST,
      workspaceId: process.env.ROXY_WORKSPACE_ID,
      timeout: process.env.ROXY_TIMEOUT,
    };
    process.env.ROXY_API_KEY = "environment-token";
    process.env.ROXY_API_HOST = "http://environment-host";
    process.env.ROXY_WORKSPACE_ID = "20";
    process.env.ROXY_TIMEOUT = "2000";
    try {
      assert.deepEqual(resolveRoxyOptions({ apiKey: undefined, apiHost: undefined }), {
        apiKey: "environment-token",
        apiHost: "http://environment-host",
        workspaceId: 20,
        timeout: 2000,
      });
    } finally {
      for (const [key, value] of Object.entries({
        ROXY_API_KEY: original.apiKey,
        ROXY_API_HOST: original.apiHost,
        ROXY_WORKSPACE_ID: original.workspaceId,
        ROXY_TIMEOUT: original.timeout,
      })) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  });

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
      const result = await runSdkCommand(
        "profiles.open",
        ["profile-1", '{"forceOpen":true}'],
        {
          roxy: { apiKey: "secret-token", workspaceId: 77 },
        },
      );

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

  test("calls raw endpoints that are not modeled by the SDK", async () => {
    const { calls, restoreFetch } = installRecorder({
      code: 0,
      msg: "ok",
      data: { enabled: true },
    });
    try {
      const result = await runApiCommand(
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

  test("calls browser MCP tools by public tool name", async () => {
    const { calls, restoreFetch } = installRecorder();
    try {
      const result = await runToolCommand("roxy_profile_list", '{"page":1,"pageSize":20}', {
        apiKey: "secret-token",
        workspaceId: 123,
      });

      assert.equal(calls[0].url.pathname, "/browser/list_v3");
      assert.equal(calls[0].url.searchParams.get("page_index"), "1");
      assert.equal(calls[0].url.searchParams.get("page_size"), "20");
      assert.equal(calls[0].url.searchParams.get("workspaceId"), "123");
      assert.match(result, /No profiles found/);
    } finally {
      restoreFetch();
    }
  });

  test("supports GET raw endpoints without workspace injection", async () => {
    const { calls, restoreFetch } = installRecorder();
    try {
      await runApiCommand(
        "GET",
        "/custom/list",
        '{"page_index":1}',
        {
          apiKey: "secret-token",
          workspaceId: 99,
        },
        {
          injectWorkspace: false,
        },
      );

      assert.equal(calls[0].url.toString(), "http://127.0.0.1:50000/custom/list?page_index=1");
      assert.equal(calls[0].options.method, "GET");
    } finally {
      restoreFetch();
    }
  });

  test("rejects unsafe or unknown SDK operation paths", async () => {
    await assert.rejects(
      runSdkCommand("__proto__.toString", [], {
        roxy: { apiKey: "secret-token" },
      }),
      /Invalid SDK operation path/,
    );
    await assert.rejects(
      runSdkCommand("profiles.missing", [], {
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

  test("parses connection options after the call subcommand", async () => {
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
        "call",
        "roxy_profile_list",
        '{"page":1}',
        "--api-key",
        "secret-token",
        "--workspace-id",
        "456",
      ]);

      assert.equal(calls[0].url.pathname, "/browser/list_v3");
      assert.equal(calls[0].url.searchParams.get("page_index"), "1");
      assert.equal(calls[0].url.searchParams.get("workspaceId"), "456");
      assert.match(output[0], /No profiles found/);
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

  test("prints CLI and browser MCP tool help", async () => {
    const originalLog = console.log;
    const output = [];
    console.log = (value) => {
      output.push(value);
    };
    try {
      await runBrowserCli(["node", "roxybrowser-openapi-mcp", "help"]);
      await runBrowserCli(["node", "roxybrowser-openapi-mcp", "help", "tools"]);
      await runBrowserCli(["node", "roxybrowser-openapi-mcp", "help", "roxy_profile_open"]);
      await runBrowserCli(["node", "roxybrowser-openapi-mcp", "help", "roxy_profile_list"]);

      assert.match(output[0], /Usage: roxybrowser-openapi-mcp/);
      assert.match(output[0], /help \[target\]/);
      assert.match(output[0], /help tools/);
      assert.match(output[0], /call <tool-name> '<args-json>'/);
      assert.doesNotMatch(output[0], /Examples:/);
      assert.doesNotMatch(output[0], /node lib\/cli\.js/);

      assert.match(output[1], /Browser MCP tools:/);
      assert.match(output[1], /- roxy_profile_create/);
      assert.match(output[1], /required: profiles/);
      assert.match(output[1], /schema: help roxy_profile_create/);
      assert.match(output[1], /call: call roxy_profile_create '<args-json>'/);

      const openHelp = JSON.parse(output[2]);
      assert.equal(openHelp.operationId, "browser.profile.open");
      assert.deepEqual(openHelp.inputSchema.required, ["dirId"]);
      assert.equal(openHelp.inputSchema.properties.dirId.type, "string");

      const filteredListHelp = JSON.parse(output[3]);
      assert.equal(filteredListHelp.name, "roxy_profile_list");
      assert.equal(filteredListHelp.inputSchema.properties.projectName.type, "string");
    } finally {
      console.log = originalLog;
    }
  });
});
