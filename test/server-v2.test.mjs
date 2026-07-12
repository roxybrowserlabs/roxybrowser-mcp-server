import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import {
  createRoxyMcpServer,
  defineTool,
} from '../lib/index.js'
import { getTextContent } from '../support/helpers.mjs'

async function connect(server) {
  const client = new Client(
    { name: 'roxybrowser-v2-test-client', version: '2.0.0' },
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

describe('createRoxyMcpServer', () => {
  test('lists context-shaped tools and dispatches through InMemoryTransport', async () => {
    const server = createRoxyMcpServer({
      roxy: { apiKey: 'secret-token' },
      context: { workspaceId: 88 },
      tools: [
        defineTool({
          name: 'browser.list',
          description: 'List browsers',
          scope: 'workspace',
          inputSchema: {
            type: 'object',
            properties: {
              workspaceId: { type: 'number' },
              pageIndex: { type: 'number' },
            },
            required: ['workspaceId'],
          },
          handler: async args => ({
            content: [{ type: 'text', text: `workspace=${args.workspaceId};page=${args.pageIndex}` }],
          }),
        }),
      ],
    })

    const session = await connect(server)

    try {
      const tools = await session.client.listTools()
      assert.equal(tools.tools.length, 1)
      assert.equal(tools.tools[0].name, 'roxy_browser_list')
      assert.equal(tools.tools[0].inputSchema.properties.workspaceId, undefined)

      const result = await session.client.callTool({
        name: 'roxy_browser_list',
        arguments: { pageIndex: 3 },
      })
      assert.equal(getTextContent(result), 'workspace=88;page=3')
    }
    finally {
      await session.close()
    }
  })

  test('returns readable tool errors', async () => {
    const server = createRoxyMcpServer({
      roxy: { apiKey: 'secret-token' },
      tools: [],
    })
    const session = await connect(server)

    try {
      const result = await session.client.callTool({
        name: 'missing.tool',
        arguments: {},
      })
      assert.match(getTextContent(result), /Unknown tool: missing.tool/)
    }
    finally {
      await session.close()
    }
  })
})
