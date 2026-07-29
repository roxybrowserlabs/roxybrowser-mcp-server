#!/usr/bin/env node

import { createRoxyBrowserMcpServer } from './mcp/index.js'
import type { CreateMcpServerOptions } from './mcp/index.js'

export * from './api/index.js'
export * from './sdk/index.js'
export * from './mcp/index.js'

export const createRoxyMcpServer = createRoxyBrowserMcpServer

export async function runServer(options: Partial<CreateMcpServerOptions> = {}): Promise<void> {
  await createRoxyBrowserMcpServer(options).run()
}
