import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import {
  ROXY_TOOLS_V2,
  createRoxyMcpServer,
} from '../lib/index.js'
import * as publicApi from '../lib/index.js'
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
  test('does not export batch-specific create handlers', () => {
    assert.equal('batchCreateBrowsers' in publicApi, false)
    assert.equal('batchCreateAccounts' in publicApi, false)
  })

  test('exposes 2.0 domain-style tool names', () => {
    const names = ROXY_TOOLS_V2.map(tool => tool.name)

    assert.ok(names.includes('browser.list'))
    assert.ok(names.includes('browser.create'))
    assert.ok(names.includes('proxy.list'))
    assert.ok(names.includes('account.create'))
    assert.equal(names.includes('roxy_list_browsers'), false)
    assert.equal(names.includes('browser.random_fingerprint'), false)
    assert.equal(names.includes('browser.batch_create'), false)
    assert.equal(names.includes('account.batch_create'), false)
  })

  test('create tools accept arrays and hide fixed workspaceId from item schemas', async () => {
    const server = createRoxyMcpServer({
      roxy: { apiKey: 'secret-token' },
      context: { workspaceId: 77 },
      tools: ROXY_TOOLS_V2,
    })
    const session = await connect(server)

    try {
      const result = await session.client.listTools()
      const names = result.tools.map(tool => tool.name)
      const browserList = result.tools.find(tool => tool.name === 'roxy_browser_list')
      const browserCreate = result.tools.find(tool => tool.name === 'roxy_browser_create')
      const browserUpdate = result.tools.find(tool => tool.name === 'roxy_browser_update')
      const proxyCreate = result.tools.find(tool => tool.name === 'roxy_proxy_create')
      const accountCreate = result.tools.find(tool => tool.name === 'roxy_account_create')

      assert.equal(names.includes('roxy_workspace_list'), false)
      assert.equal(names.includes('roxy_project_list'), true)
      assert.equal(browserList.inputSchema.properties.workspaceId, undefined)
      assert.equal(browserCreate.inputSchema.properties.browsers.items.properties.workspaceId, undefined)
      assert.deepEqual(browserCreate.inputSchema.properties.browsers.items.required, ['browserCore'])
      assert.deepEqual(browserCreate.inputSchema.required, ['browsers'])
      assert.equal(browserCreate.inputSchema.properties.browsers.items.properties.fingerInfo.type, 'object')
      assert.equal(browserCreate.inputSchema.properties.browsers.items.properties.fingerInfo.properties, undefined)
      assert.equal(browserUpdate.inputSchema.properties.fingerInfo.type, 'object')
      assert.equal(browserUpdate.inputSchema.properties.fingerInfo.properties, undefined)
      assert.equal(browserCreate.inputSchema.properties.browsers.items.properties.proxyInfo.type, 'object')
      assert.equal(browserCreate.inputSchema.properties.browsers.items.properties.proxyInfo.properties, undefined)
      assert.equal(browserUpdate.inputSchema.properties.proxyInfo.type, 'object')
      assert.equal(browserUpdate.inputSchema.properties.proxyInfo.properties, undefined)
      assert.equal(browserCreate.inputSchema.properties.browsers.items.properties.windowPlatformList.type, 'array')
      assert.equal(browserCreate.inputSchema.properties.browsers.items.properties.windowPlatformList.items.properties, undefined)
      assert.equal(browserUpdate.inputSchema.properties.windowPlatformList.type, 'array')
      assert.equal(browserUpdate.inputSchema.properties.windowPlatformList.items.properties, undefined)
      assert.equal(proxyCreate.inputSchema.properties.proxyList.items.properties.workspaceId, undefined)
      assert.deepEqual(proxyCreate.inputSchema.required, ['proxyList'])
      assert.equal(accountCreate.inputSchema.properties.accountList.items.properties.workspaceId, undefined)
      assert.deepEqual(accountCreate.inputSchema.required, ['accountList'])
    }
    finally {
      await session.close()
    }
  })

  test('lists roxy_workspace_list without fixed workspace context', async () => {
    const server = createRoxyMcpServer({
      roxy: { apiKey: 'secret-token' },
      tools: ROXY_TOOLS_V2,
    })
    const session = await connect(server)

    try {
      const result = await session.client.listTools()
      const names = result.tools.map(tool => tool.name)

      assert.equal(names.includes('roxy_workspace_list'), true)
      assert.equal(names.includes('roxy_project_list'), false)
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
        name: 'roxy_project_list',
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
        name: 'roxy_browser_list',
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

  test('browser.create uses the batch-shaped input and injects workspaceId into each item', async () => {
    const calledRequests = []
    let activeRequests = 0
    let maxConcurrentRequests = 0
    const restoreFetch = installFetchMock(async (url, options) => {
      activeRequests += 1
      maxConcurrentRequests = Math.max(maxConcurrentRequests, activeRequests)
      calledRequests.push({ url, options })
      try {
        await new Promise(resolve => setTimeout(resolve, 10))
        return createJsonResponse({
          code: 0,
          msg: 'ok',
          data: {
            dirId: `browser-${calledRequests.length}`,
          },
        })
      }
      finally {
        activeRequests -= 1
      }
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
        name: 'roxy_browser_create',
        arguments: {
          browsers: [
            { browserCore: 'chromium', projectId: 11 },
            { browserCore: 'chromium', projectId: 12 },
          ],
        },
      })

      assert.equal(calledRequests.length, 2)
      assert.equal(maxConcurrentRequests, 1)
      assert.match(calledRequests[0].url, /^http:\/\/127\.0\.0\.1:50000\/browser\/create$/)
      assert.equal(calledRequests[0].options.headers.token, 'instance-token')
      assert.equal(JSON.parse(calledRequests[0].options.body).workspaceId, 77)
      assert.equal(JSON.parse(calledRequests[1].options.body).workspaceId, 77)
      assert.match(getTextContent(result), /Successfully created 2 browsers/)
    }
    finally {
      restoreFetch()
      await session.close()
    }
  })

  test('proxy.create uses array input and sends one batch request with bound workspaceId', async () => {
    let calledUrl
    let calledBody
    const restoreFetch = installFetchMock(async (url, options) => {
      calledUrl = url
      calledBody = JSON.parse(options.body)
      return createJsonResponse({
        code: 0,
        msg: 'ok',
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
      await session.client.callTool({
        name: 'roxy_proxy_create',
        arguments: {
          proxyList: [
            { protocol: 'HTTP', host: '1.2.3.4', port: '8080' },
            { protocol: 'SOCKS5', host: '5.6.7.8', port: '1080' },
          ],
        },
      })

      assert.match(calledUrl, /^http:\/\/127\.0\.0\.1:50000\/proxy\/batch_create$/)
      assert.equal(calledBody.workspaceId, 77)
      assert.equal(calledBody.proxyList.length, 2)
      assert.equal(calledBody.proxyList[0].workspaceId, undefined)
      assert.equal(calledBody.proxyList[1].workspaceId, undefined)
    }
    finally {
      restoreFetch()
      await session.close()
    }
  })

  test('account.create uses array input and sends one batch request with bound workspaceId', async () => {
    let calledUrl
    let calledBody
    const restoreFetch = installFetchMock(async (url, options) => {
      calledUrl = url
      calledBody = JSON.parse(options.body)
      return createJsonResponse({
        code: 0,
        msg: 'ok',
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
      await session.client.callTool({
        name: 'roxy_account_create',
        arguments: {
          accountList: [
            {
              platformUrl: 'https://www.tiktok.com/',
              platformUserName: 'alice',
              platformPassword: 'secret',
            },
          ],
        },
      })

      assert.match(calledUrl, /^http:\/\/127\.0\.0\.1:50000\/account\/batch_create$/)
      assert.equal(calledBody.workspaceId, 77)
      assert.equal(calledBody.accountList.length, 1)
      assert.equal(calledBody.accountList[0].workspaceId, undefined)
    }
    finally {
      restoreFetch()
      await session.close()
    }
  })
})
