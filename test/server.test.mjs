import assert from 'node:assert/strict'
import { afterEach, describe, test } from 'node:test'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import {
  RoxyBrowserMCPServer,
  TOOLS,
} from '../lib/index.js'
import {
  captureEnv,
  createJsonResponse,
  getTextContent,
  installFetchMock,
  restoreEnv,
  withConnectedClient,
} from '../support/helpers.mjs'

const initialEnv = captureEnv()

afterEach(() => {
  restoreEnv(initialEnv)
})

describe('RoxyBrowserMCPServer', () => {
  test('lists the exported tools through MCP', async () => {
    const session = await withConnectedClient({
      Client,
      InMemoryTransport,
      RoxyBrowserMCPServer,
    })

    try {
      const result = await session.client.listTools()
      assert.equal(result.tools.length, TOOLS.length)
      assert.deepEqual(
        result.tools.map(tool => tool.name),
        TOOLS.map(tool => tool.name),
      )
      assert.ok(result.tools.every(tool => /^[a-zA-Z0-9_-]+$/.test(tool.name)))
    }
    finally {
      await session.close()
    }
  })

  test('returns a readable error for unknown tools', async () => {
    const session = await withConnectedClient({
      Client,
      InMemoryTransport,
      RoxyBrowserMCPServer,
    })

    try {
      const result = await session.client.callTool({
        name: 'roxy_unknown_tool',
        arguments: {},
      })
      const text = getTextContent(result)
      assert.match(text, /Unknown tool: roxy_unknown_tool/)
    }
    finally {
      await session.close()
    }
  })

  test('routes tool calls to handlers', async () => {
    process.env.ROXY_API_HOST = 'http://127.0.0.1:50000'
    process.env.ROXY_API_KEY = 'secret-token'

    const restoreFetch = installFetchMock(async () =>
      createJsonResponse({
        code: 0,
        msg: 'ok',
        data: {
          total: 1,
          rows: [
            {
              id: 9,
              workspaceName: 'Workspace A',
              project_details: [
                { projectId: 3, projectName: 'Project A' },
              ],
            },
          ],
        },
      }),
    )

    const session = await withConnectedClient({
      Client,
      InMemoryTransport,
      RoxyBrowserMCPServer,
    })

    try {
      const result = await session.client.callTool({
        name: 'roxy_workspace_list',
        arguments: { pageIndex: 1, pageSize: 5 },
      })
      const text = getTextContent(result)
      assert.match(text, /Workspace A/)
      assert.match(text, /Project A/)
    }
    finally {
      restoreFetch()
      await session.close()
    }
  })
})
