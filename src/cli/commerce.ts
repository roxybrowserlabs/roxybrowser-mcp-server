#!/usr/bin/env node

import { Command } from "commander";
import dotenv from "dotenv";
import { createRoxyCommerceMcpServer } from "../mcp/index.js";

dotenv.config();

export async function runCommerceCli(argv = process.argv): Promise<void> {
  const program = new Command();
  program
    .name("roxycommerce-mcp")
    .description("RoxyBrowser MCP Server - ecommerce account mode")
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
  await createRoxyCommerceMcpServer({
    roxy: {
      apiHost: options.apiHost,
      apiKey: options.apiKey,
      timeout: options.timeout,
      workspaceId: options.workspaceId,
    },
    context: {
      workspaceId: options.workspaceId,
    },
  }).run();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCommerceCli().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
