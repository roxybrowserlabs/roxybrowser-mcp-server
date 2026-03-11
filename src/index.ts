#!/usr/bin/env node

/**
 * RoxyBrowser MCP Server
 *
 * Model Context Protocol server for RoxyBrowser automation.
 * Supports: CLI startup, programmatic (in-process) startup, and library usage for secondary development.
 */

import { fileURLToPath } from 'node:url'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { batchCreateAccounts, createAccount, deleteAccounts, listAccounts, modifyAccount } from './modules/account.js'
import { batchCreateBrowsers, clearLocalCache, clearServerCache, closeBrowsers, createBrowser, deleteBrowsers, getBrowserDetail, getConnectionInfo, listBrowsers, listLabels, openBrowser, randomFingerprint, updateBrowser } from './modules/browser.js'
import { healthCheck, listWorkspaces } from './modules/other.js'
import { batchCreateProxies, createProxy, deleteProxies, detectProxy, modifyProxy, proxyList, proxyStore } from './modules/proxy.js'

// ========== Tool Definitions ==========
export const TOOLS = [
  listBrowsers.schema,
  batchCreateBrowsers.schema,
  createBrowser.schema,
  openBrowser.schema,
  updateBrowser.schema,
  closeBrowsers.schema,
  deleteBrowsers.schema,
  getBrowserDetail.schema,
  clearLocalCache.schema,
  clearServerCache.schema,
  randomFingerprint.schema,
  listLabels.schema,
  getConnectionInfo.schema,

  proxyList.schema,
  proxyStore.schema,
  createProxy.schema,
  batchCreateProxies.schema,
  detectProxy.schema,
  modifyProxy.schema,
  deleteProxies.schema,
  // getDetectChannels.schema,

  listAccounts.schema,
  createAccount.schema,
  batchCreateAccounts.schema,
  modifyAccount.schema,
  deleteAccounts.schema,

  listWorkspaces.schema,
  healthCheck.schema,
]

// ========== MCP Server ==========

export class RoxyBrowserMCPServer {
  private server: Server
  constructor() {
    this.server = new Server(
      {
        name: 'roxybrowser-openapi-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    )

    this.setupHandlers()
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOLS,
    }))

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params

      try {
        switch (name) {
          // 浏览器相关
          case listBrowsers.name:
            return await listBrowsers.handle(args)

          case createBrowser.name:
            return await createBrowser.handle(args)

          case openBrowser.name:
            return await openBrowser.handle(args)

          case updateBrowser.name:
            return await updateBrowser.handle(args)

          case closeBrowsers.name:
            return await closeBrowsers.handle(args)

          case deleteBrowsers.name:
            return await deleteBrowsers.handle(args)

          case batchCreateBrowsers.name:
            return await batchCreateBrowsers.handle(args)

          case listLabels.name:
            return await listLabels.handle(args)

          case getConnectionInfo.name:
            return await getConnectionInfo.handle(args)

          case randomFingerprint.name:
            return await randomFingerprint.handle(args)

          case clearLocalCache.name:
            return await clearLocalCache.handle(args)

          case clearServerCache.name:
            return await clearServerCache.handle(args)

          case getBrowserDetail.name:
            return await getBrowserDetail.handle(args)

          // 账号相关
          case listAccounts.name:
            return await listAccounts.handle(args)

          case createAccount.name:
            return await createAccount.handle(args)

          case batchCreateAccounts.name:
            return await batchCreateAccounts.handle(args)

          case modifyAccount.name:
            return await modifyAccount.handle(args)

          case deleteAccounts.name:
            return await deleteAccounts.handle(args)

          // 代理相关
          case proxyList.name:
            return await proxyList.handle(args)

          case proxyStore.name:
            return await proxyStore.handle(args)

          case createProxy.name:
            return await createProxy.handle(args)

          case batchCreateProxies.name:
            return await batchCreateProxies.handle(args)

          case detectProxy.name:
            return await detectProxy.handle(args)

          case modifyProxy.name:
            return await modifyProxy.handle(args)

          case deleteProxies.name:
            return await deleteProxies.handle(args)

          // 空间列表
          case listWorkspaces.name:
            return await listWorkspaces.handle(args)

          // 健康检查
          case healthCheck.name:
            return await healthCheck.handle(args)

          default:
            throw new Error(`Unknown tool: ${name}`)
        }
      }
      catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: error instanceof Error ? error.message : 'Unknown error',
            },
          ],
        }
      }
    })
  }

  async run() {
    console.error('🚀 Starting RoxyBrowser MCP Server...')

    const transport = new StdioServerTransport()
    await this.server.connect(transport)

    console.error('✅ RoxyBrowser MCP Server is running')
  }
}

// ========== Programmatic API ==========

/**
 * Create and run MCP server with stdio transport (for in-process usage).
 * Use when embedding the server in your own Node process.
 */
export async function runServer(): Promise<void> {
  const server = new RoxyBrowserMCPServer()
  await server.run()
}

// ========== Library exports for secondary development ==========

export {
  listBrowsers,
  batchCreateBrowsers,
  createBrowser,
  openBrowser,
  updateBrowser,
  closeBrowsers,
  deleteBrowsers,
  getBrowserDetail,
  clearLocalCache,
  clearServerCache,
  randomFingerprint,
  listLabels,
  getConnectionInfo,
} from './modules/browser.js'

export {
  proxyList,
  proxyStore,
  createProxy,
  batchCreateProxies,
  detectProxy,
  modifyProxy,
  deleteProxies,
} from './modules/proxy.js'

export {
  listAccounts,
  createAccount,
  batchCreateAccounts,
  modifyAccount,
  deleteAccounts,
} from './modules/account.js'

export { listWorkspaces, healthCheck } from './modules/other.js'

export { request, resolveConfig, DEFAULT_CONFIG } from './utils/index.js'
export type * from './types.js'
