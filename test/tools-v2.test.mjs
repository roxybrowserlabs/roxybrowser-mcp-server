import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import {
  ROXY_TOOLS_V2,
  createRoxyMcpServer,
} from '../lib/index.js'
import {
  createJsonResponse,
  getTextContent,
  installFetchMock,
} from '../support/helpers.mjs'

async function connect(server) {
  const client = new Client(
    { name: 'roxybrowser-tools-v2-test-client', version: '2.0.0' },
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

describe('ROXY_TOOLS_V2', () => {
  test('exposes 2.0 domain-style tool names', () => {
    const names = ROXY_TOOLS_V2.map(tool => tool.name)

    assert.ok(names.includes('browser.list'))
    assert.ok(names.includes('browser.batch_create'))
    assert.ok(names.includes('proxy.list'))
    assert.ok(names.includes('account.create'))
    assert.equal(names.includes('roxy_list_browsers'), false)
    assert.equal(names.includes('browser.random_fingerprint'), false)
  })

  test('hides fixed workspaceId from root and batch item schemas', async () => {
    const server = createRoxyMcpServer({
      roxy: { apiKey: 'secret-token' },
      context: { workspaceId: 77 },
      tools: ROXY_TOOLS_V2,
    })
    const session = await connect(server)

    try {
      const result = await session.client.listTools()
      const names = result.tools.map(tool => tool.name)
      const browserList = result.tools.find(tool => tool.name === 'browser.list')
      const batchCreate = result.tools.find(tool => tool.name === 'browser.batch_create')

      assert.equal(names.includes('workspace.list'), false)
      assert.equal(names.includes('project.list'), true)
      assert.equal(browserList.inputSchema.properties.workspaceId, undefined)
      assert.equal(batchCreate.inputSchema.properties.browsers.items.properties.workspaceId, undefined)
      assert.deepEqual(batchCreate.inputSchema.properties.browsers.items.required, ['browserCore'])
    }
    finally {
      await session.close()
    }
  })

  test('lists workspace.list without fixed workspace context', async () => {
    const server = createRoxyMcpServer({
      roxy: { apiKey: 'secret-token' },
      tools: ROXY_TOOLS_V2,
    })
    const session = await connect(server)

    try {
      const result = await session.client.listTools()
      const names = result.tools.map(tool => tool.name)

      assert.equal(names.includes('workspace.list'), true)
      assert.equal(names.includes('project.list'), false)
    }
    finally {
      await session.close()
    }
  })

  test('project.list returns projects for the fixed workspace only', async () => {
    const restoreFetch = installFetchMock(async (url) => {
      assert.match(url, /\/project\/list\?/)
      assert.match(url, /workspaceId=77/)
      assert.match(url, /page_index=2/)
      assert.match(url, /page_size=5/)
      return createJsonResponse({
        code: 0,
        msg: 'ok',
        data: {
          total: 2,
          rows: [
            { projectId: 11, projectName: 'Alpha' },
            { id: 12, name: 'Beta' },
          ],
        },
      })
    })

    const server = createRoxyMcpServer({
      roxy: {
        apiHost: 'http://127.0.0.1:50000',
        apiKey: 'instance-token',
      },
      context: { workspaceId: 77 },
      tools: ROXY_TOOLS_V2,
    })
    const session = await connect(server)

    try {
      const result = await session.client.callTool({
        name: 'project.list',
        arguments: { pageIndex: 2, pageSize: 5 },
      })
      const text = getTextContent(result)

      assert.match(text, /Found 2 project\(s\) in workspaceId 77/)
      assert.match(text, /Alpha → projectId: \*\*11\*\*/)
      assert.match(text, /Beta → projectId: \*\*12\*\*/)
      assert.match(text, /Pagination: page=2/)
    }
    finally {
      restoreFetch()
      await session.close()
    }
  })

  test('injects workspaceId and uses server client config for adapted handlers', async () => {
    let calledUrl
    let calledOptions
    const restoreFetch = installFetchMock(async (url, options) => {
      calledUrl = url
      calledOptions = options
      return createJsonResponse({
        code: 0,
        msg: 'ok',
        data: {
          total: 0,
          rows: [],
        },
      })
    })

    const server = createRoxyMcpServer({
      roxy: {
        apiHost: 'http://127.0.0.1:50000',
        apiKey: 'instance-token',
      },
      context: { workspaceId: 77 },
      tools: ROXY_TOOLS_V2,
    })
    const session = await connect(server)

    try {
      const result = await session.client.callTool({
        name: 'browser.list',
        arguments: { pageIndex: 2, pageSize: 5 },
      })

      assert.match(calledUrl, /^http:\/\/127\.0\.0\.1:50000\/browser\/list_v3\?/)
      assert.match(calledUrl, /workspaceId=77/)
      assert.match(calledUrl, /page_index=2/)
      assert.equal(calledOptions.headers.token, 'instance-token')
      assert.match(getTextContent(result), /No browsers found in workspace 77/)
    }
    finally {
      restoreFetch()
      await session.close()
    }
  })
})
