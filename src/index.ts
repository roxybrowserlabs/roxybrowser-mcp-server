#!/usr/bin/env node

import { createRoxyBrowserMcpServer } from "./mcp/index.js";
import type { CreateRoxyBrowserMcpServerOptions } from "./mcp/index.js";

export * from "./api/index.js";
export * from "./sdk/index.js";
export * from "./mcp/index.js";
export * from "./version.js";

export const createRoxyMcpServer = createRoxyBrowserMcpServer;

export async function runServer(options: CreateRoxyBrowserMcpServerOptions = {}): Promise<void> {
  await createRoxyBrowserMcpServer(options).run();
}
