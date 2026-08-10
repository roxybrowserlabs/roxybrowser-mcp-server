#!/usr/bin/env node

import { Command } from "commander";
import dotenv from "dotenv";
import { createRoxyBrowserMcpServer } from "../mcp/index.js";

dotenv.config();

export async function runBrowserCli(argv = process.argv): Promise<void> {
  const program = new Command();
  program
    .name("roxybrowser-openapi-mcp")
    .description("RoxyBrowser MCP Server - browser profile mode")
    .option(
      "-H, --api-host <url>",
      "RoxyBrowser API base URL",
      process.env.ROXY_API_HOST ?? "http://127.0.0.1:50000",
    )
    .option("-k, --api-key <key>", "API key", process.env.ROXY_API_KEY ?? "")
    .option("-w, --workspace-id <id>", "Default workspace ID", (value) =>
      Number.parseInt(value, 10),
    )
    .option(
      "-t, --timeout <ms>",
      "Request timeout in milliseconds",
      (value) => Number.parseInt(value, 10),
      process.env.ROXY_TIMEOUT ? Number(process.env.ROXY_TIMEOUT) : 30_000,
    );

  program.parse(argv);
  const options = program.opts();
  const workspaceId =
    options.workspaceId ??
    (process.env.ROXY_WORKSPACE_ID
      ? Number.parseInt(process.env.ROXY_WORKSPACE_ID, 10)
      : undefined);
  await createRoxyBrowserMcpServer({
    roxy: {
      apiHost: options.apiHost,
      apiKey: options.apiKey,
      timeout: options.timeout,
      workspaceId,
    },
    context: {
      workspaceId,
    },
  }).run();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runBrowserCli().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
