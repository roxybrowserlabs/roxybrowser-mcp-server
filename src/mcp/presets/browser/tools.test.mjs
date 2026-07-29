import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { createRoxyBrowserMcpServer, createRoxyCommerceMcpServer } from '../../../../lib/index.js'
import { RoxyPresetMcpServer } from '../../../../lib/mcp/runtime/index.js'
import { createJsonResponse, getTextContent, installFetchMock } from '../../../../support/helpers.mjs'

async function connect(server) {
  const client = new Client({ name: 'mcp-test-client', version: '3.0.0' }, { capabilities: {} })
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
  return {
    client,
    async close() {
      await Promise.all([clientTransport.close(), serverTransport.close()])
    },
  }
}

describe('3.0 MCP presets', () => {
  test('browser preset exposes profile tools instead of raw endpoint names', async () => {
    const server = createRoxyBrowserMcpServer({ roxy: { apiKey: 'secret-token', workspaceId: 77 } })
    const session = await connect(server)
    try {
      const result = await session.client.listTools()
      const names = result.tools.map(tool => tool.name)

      assert.equal(names.length, 27)
      assert.ok(names.includes('roxy_workspace_list'))
      assert.ok(names.includes('roxy_project_list'))
      assert.ok(names.includes('roxy_label_list'))
      assert.ok(names.includes('roxy_profile_list'))
      assert.ok(names.includes('roxy_profile_open'))
      assert.ok(names.includes('roxy_profile_update'))
      assert.ok(names.includes('roxy_profile_connection_info'))
      assert.ok(names.includes('roxy_proxy_create'))
      assert.ok(names.includes('roxy_proxy_detect_channels'))
      assert.ok(names.includes('roxy_platform_account_delete'))
      assert.equal(names.includes('roxy_browser_list'), false)
      assert.equal(names.includes('roxy_list_browsers'), false)
    }
    finally {
      await session.close()
    }
  })

  test('commerce preset exposes account tools backed by browser endpoints', async () => {
    const restoreFetch = installFetchMock(async () =>
      createJsonResponse({
        code: 0,
        msg: 'ok',
        data: {
          total: 1,
          rows: [{ dirId: 'account-1', windowName: 'Amazon Store A', projectId: 3 }],
        },
      }),
    )
    const server = createRoxyCommerceMcpServer({ roxy: { apiKey: 'secret-token', workspaceId: 77 } })
    const session = await connect(server)

    try {
      const tools = await session.client.listTools()
      const names = tools.tools.map(tool => tool.name)
      assert.equal(names.length, 20)
      assert.ok(names.includes('roxy_account_list'))
      assert.ok(names.includes('roxy_account_update'))
      assert.ok(names.includes('roxy_proxy_create_many'))
      assert.ok(names.includes('roxy_platform_credential_list'))
      assert.ok(names.includes('roxy_platform_credential_delete'))
      assert.equal(names.includes('roxy_profile_list'), false)

      const result = await session.client.callTool({
        name: 'roxy_account_list',
        arguments: { keyword: 'Amazon' },
      })
      assert.match(getTextContent(result), /Amazon Store A/)
    }
    finally {
      restoreFetch()
      await session.close()
    }
  })

  test('runtime formats unknown tools and handler errors as text responses', async () => {
    const restoreFetch = installFetchMock(async () =>
      createJsonResponse({ code: 0, msg: 'ok', data: { total: 0, rows: [] } }),
    )
    const server = createRoxyBrowserMcpServer({ roxy: { apiKey: 'secret-token', workspaceId: 77 } })
    const session = await connect(server)

    try {
      const unknown = await session.client.callTool({
        name: 'roxy_missing_tool',
        arguments: {},
      })
      assert.match(getTextContent(unknown), /Unknown tool: roxy_missing_tool/)

      const failed = await session.client.callTool({
        name: 'roxy_profile_get',
        arguments: { id: 'missing' },
      })
      assert.match(getTextContent(failed), /fetch failed|Profile not found|API key/i)
    }
    finally {
      restoreFetch()
      await session.close()
    }
  })

  test('runtime handles custom tools and non-Error failures', async () => {
    const server = new RoxyPresetMcpServer({
      name: 'custom-roxy-mcp',
      tools: [{
        name: 'roxy_custom_fail',
        operationId: 'custom.fail',
        endpoint: 'POST /custom/fail',
        description: 'Fail with a non-Error value.',
        inputSchema: { type: 'object', properties: {} },
        handler: async () => {
          throw 'plain failure'
        },
      }],
    }, {})
    const session = await connect(server)

    try {
      const tools = await session.client.listTools()
      assert.equal(tools.tools[0].description, 'Fail with a non-Error value.')
      const result = await session.client.callTool({ name: 'roxy_custom_fail', arguments: undefined })
      assert.equal(getTextContent(result), 'Unknown error')
    }
    finally {
      await session.close()
    }
  })

  test('preset factories support default options and custom tool catalogs', async () => {
    const browserSession = await connect(createRoxyBrowserMcpServer())
    const commerceSession = await connect(createRoxyCommerceMcpServer({
      context: { workspaceId: 77 },
      tools: [{
        name: 'roxy_custom_ok',
        operationId: 'custom.ok',
        endpoint: 'GET /custom/ok',
        description: 'Custom ok tool.',
        inputSchema: { type: 'object', properties: {} },
        handler: async () => 'ok',
      }],
    }))

    try {
      const browserTools = await browserSession.client.listTools()
      const commerceTools = await commerceSession.client.listTools()
      assert.ok(browserTools.tools.some(tool => tool.name === 'roxy_profile_list'))
      assert.deepEqual(commerceTools.tools.map(tool => tool.name), ['roxy_custom_ok'])
    }
    finally {
      await browserSession.close()
      await commerceSession.close()
    }
  })
})
