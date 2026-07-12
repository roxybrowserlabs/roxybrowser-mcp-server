import 'dotenv/config'
import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import {
  RoxyClient,
  createRoxyMcpServer,
} from '../lib/index.js'
import { getTextContent } from '../support/helpers.mjs'

function requireEnv(name) {
  const value = process.env[name]
  assert.ok(value && value.trim() !== '', `${name} must be set for real integration tests`)
  return value
}

function getRealConfig() {
  return {
    apiKey: requireEnv('ROXY_API_KEY'),
    apiHost: process.env.ROXY_API_HOST || 'http://127.0.0.1:50000',
    workspaceId: Number(requireEnv('ROXY_TEST_WORKSPACE_ID')),
  }
}

async function connect(server) {
  const client = new Client(
    { name: 'roxybrowser-real-integration-client', version: '2.0.0' },
    { capabilities: {} },
  )
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()

  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ])

  return {
    client,
    async close() {
      await Promise.all([
        clientTransport.close(),
        serverTransport.close(),
      ])
    },
  }
}

describe('real RoxyBrowser API integration', () => {
  test('RoxyClient reaches the real health endpoint', async () => {
    const config = getRealConfig()
    const client = new RoxyClient(config)

    const result = await client.request('/health', { method: 'GET' })

    assert.equal(typeof result.code, 'number')
    assert.equal(typeof result.msg, 'string')
    assert.equal(result.code, 0, `health endpoint returned non-zero code: ${result.msg}`)
  })

  test('roxy_workspace_list returns real workspace data through MCP', async () => {
    const config = getRealConfig()
    const server = createRoxyMcpServer({
      roxy: config,
    })
    const session = await connect(server)

    try {
      const result = await session.client.callTool({
        name: 'roxy_workspace_list',
        arguments: { pageIndex: 1, pageSize: 20 },
      })
      const text = getTextContent(result)

      assert.match(text, /Found \d+ workspace\(s\)/)
      assert.match(text, /workspaceId:/)
    }
    finally {
      await session.close()
    }
  })

  test('fixed workspace context hides workspaceId and injects it into read-only tools', async () => {
    const config = getRealConfig()
    const server = createRoxyMcpServer({
      roxy: config,
      context: { workspaceId: config.workspaceId },
    })
    const session = await connect(server)

    try {
      const tools = await session.client.listTools()
      const toolNames = tools.tools.map(tool => tool.name)
      assert.equal(toolNames.includes('roxy_workspace_list'), false)
      assert.equal(toolNames.includes('roxy_project_list'), true)
      for (const name of ['roxy_browser_list', 'roxy_proxy_list', 'roxy_account_list']) {
        const tool = tools.tools.find(item => item.name === name)
        assert.ok(tool, `${name} should be listed`)
        assert.equal(tool.inputSchema.properties.workspaceId, undefined)
      }

      const projectResult = await session.client.callTool({
        name: 'roxy_project_list',
        arguments: {},
      })
      assert.match(getTextContent(projectResult), new RegExp(`workspaceId:? ${config.workspaceId}`))

      const browserResult = await session.client.callTool({
        name: 'roxy_browser_list',
        arguments: { pageIndex: 1, pageSize: 5 },
      })
      assert.match(getTextContent(browserResult), new RegExp(`workspace ${config.workspaceId}`))

      const proxyResult = await session.client.callTool({
        name: 'roxy_proxy_list',
        arguments: { pageIndex: 1, pageSize: 5 },
      })
      assert.match(getTextContent(proxyResult), /(proxy list|get proxy list failed)/i)

      const accountResult = await session.client.callTool({
        name: 'roxy_account_list',
        arguments: { pageIndex: 1, pageSize: 5 },
      })
      assert.match(getTextContent(accountResult), /(accounts in workspace|Failed to list accounts)/)
    }
    finally {
      await session.close()
    }
  })
})
