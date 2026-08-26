#!/usr/bin/env node

import { Command } from "commander";
import dotenv from "dotenv";
import { createRoxyBrowserMcpServer } from "../mcp/index.js";
import {
  addDebugCommands,
  addRoxyOptions,
  getRoxyCommandOptions,
  resolveRoxyOptions,
} from "./debug.js";

dotenv.config({ quiet: true });

export async function runBrowserCli(argv = process.argv): Promise<void> {
  const program = new Command();
  addRoxyOptions(
    program
      .name("roxybrowser-openapi-mcp")
      .description("RoxyBrowser MCP Server - browser profile mode")
      .action(async () => {
        const roxyOptions = resolveRoxyOptions(getRoxyCommandOptions(program));
        await createRoxyBrowserMcpServer({
          roxy: roxyOptions,
          context: {
            workspaceId: roxyOptions.workspaceId,
          },
        }).run();
      }),
  );

  addDebugCommands(program, {
    getRoxyOptions: (overrides, sources) =>
      resolveRoxyOptions(getRoxyCommandOptions(program), overrides, sources),
  });

  await program.parseAsync(argv);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runBrowserCli().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
