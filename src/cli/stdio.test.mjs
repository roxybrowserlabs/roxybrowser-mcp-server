import assert from "node:assert/strict";
import { existsSync, realpathSync } from "node:fs";
import { createServer } from "node:http";
import { delimiter, isAbsolute, join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { describe, test } from "vite-plus/test";

async function connectCli(args) {
  const command = isAbsolute(process.execPath)
    ? process.execPath
    : process.env.PATH?.split(delimiter)
        .map((pathEntry) => join(pathEntry, process.execPath))
        .find(existsSync);
  assert.ok(command, `Unable to resolve Node executable: ${process.execPath}`);
  const transport = new StdioClientTransport({
    command: realpathSync(command),
    args: ["lib/cli.js", ...args],
    cwd: process.cwd(),
    stderr: "pipe",
  });
  const client = new Client({ name: "cli-stdio-test", version: "1.0.0" }, { capabilities: {} });
  await client.connect(transport);
  return client;
}

describe("MCP CLI stdio entry", () => {
  test("starts the browser MCP server from root options", async () => {
    const backend = createServer((request, response) => {
      if (request.url === "/browser/workspace/active" && request.method === "GET") {
        response.writeHead(200, { "content-type": "application/json" });
        response.end(
          JSON.stringify({
            code: 0,
            data: { id: 321, workspaceName: "Test", project_details: [] },
            msg: "ok",
          }),
        );
        return;
      }
      response.writeHead(404, { "content-type": "application/json" });
      response.end(JSON.stringify({ code: 404, msg: "not found" }));
    });
    await new Promise((resolve) => backend.listen(0, "127.0.0.1", resolve));
    const address = backend.address();
    assert.ok(address && typeof address === "object");
    let client;
    try {
      client = await connectCli([
        "--api-key",
        "secret-token",
        "--workspace-id",
        "321",
        "--api-host",
        `http://127.0.0.1:${address.port}`,
      ]);
      const result = await client.listTools();
      assert.ok(result.tools.some((tool) => tool.name === "roxy_profile_list"));
    } finally {
      if (client) await client.close();
      await new Promise((resolve, reject) =>
        backend.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });
});
