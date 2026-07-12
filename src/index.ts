#!/usr/bin/env node

import { createPublicToolSchema } from './runtime/index.js'
import {
  createRoxyMcpServer,
  RoxyMcpServer,
  type RoxyMcpServerOptions,
} from './server/index.js'
import { ROXY_TOOLS_V2 } from './tools/index.js'

export const TOOLS = ROXY_TOOLS_V2
  .filter(tool => tool.isAvailable?.({}) ?? true)
  .map(tool => createPublicToolSchema(tool, {}))

export class RoxyBrowserMCPServer extends RoxyMcpServer {
  constructor(options: RoxyMcpServerOptions = {}) {
    super(options)
  }
}

export async function runServer(options: RoxyMcpServerOptions = {}): Promise<void> {
  const server = createRoxyMcpServer(options)
  await server.run()
}

export {
  clearLocalCache,
  clearServerCache,
  closeBrowsers,
  createBrowser,
  deleteBrowsers,
  getBrowserDetail,
  getConnectionInfo,
  listBrowsers,
  listLabels,
  openBrowser,
  randomFingerprint,
  updateBrowser,
} from './modules/browser.js'

export {
  createProxies,
  deleteProxies,
  detectProxy,
  modifyProxy,
  proxyDetail,
  proxyList,
} from './modules/proxy.js'

export {
  createAccount,
  deleteAccounts,
  listAccounts,
  modifyAccount,
} from './modules/account.js'

export { healthCheck, listProjects, listWorkspaces } from './modules/other.js'

export { DEFAULT_CONFIG, request, resolveConfig, runWithRoxyClient } from './utils/index.js'
export * from './client/index.js'
export * from './runtime/index.js'
export * from './server/index.js'
export * from './tools/index.js'
export type * from './types.js'
