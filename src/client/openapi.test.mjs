import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { RoxyOpenAPI } from '../../lib/index.js'
import {
  createJsonResponse,
  installFetchMock,
} from '../../support/helpers.mjs'

function installRecorder() {
  const calls = []
  const restoreFetch = installFetchMock(async (url, options) => {
    calls.push({
      url: new URL(url),
      options,
      body: options.body ? JSON.parse(options.body) : undefined,
    })
    return createJsonResponse({ code: 0, msg: 'Success', data: { ok: true } })
  })

  return {
    calls,
    restoreFetch,
  }
}

function createClient(options = {}) {
  return new RoxyOpenAPI({
    apikey: 'secret-token',
    baseUrl: 'http://127.0.0.1:50000/',
    timeout: 30000,
    ...options,
  })
}

describe('RoxyOpenAPI transport', () => {
  test('builds authenticated GET requests with query params', async () => {
    const { calls, restoreFetch } = installRecorder()

    try {
      const client = createClient()

      const result = await client.browser.list({
        workspaceId: 1,
        dirIds: 'a,b',
        page_index: 2,
        page_size: 50,
      })

      assert.deepEqual(result, { code: 0, msg: 'Success', data: { ok: true } })
      assert.equal(calls[0].url.toString(), 'http://127.0.0.1:50000/browser/list_v3?workspaceId=1&dirIds=a%2Cb&page_index=2&page_size=50')
      assert.equal(calls[0].options.method, 'GET')
      assert.equal(calls[0].options.headers.token, 'secret-token')
      assert.equal(calls[0].options.headers['Content-Type'], 'application/json')
      assert.equal(calls[0].body, undefined)
    }
    finally {
      restoreFetch()
    }
  })

  test('builds authenticated POST requests with JSON bodies', async () => {
    const { calls, restoreFetch } = installRecorder()

    try {
      const client = createClient()

      await client.browser.create({
        workspaceId: 1,
        windowName: 'Roxytest',
      })

      assert.equal(calls[0].url.toString(), 'http://127.0.0.1:50000/browser/create')
      assert.equal(calls[0].options.method, 'POST')
      assert.deepEqual(calls[0].body, {
        workspaceId: 1,
        windowName: 'Roxytest',
      })
    }
    finally {
      restoreFetch()
    }
  })

  test('applies default workspaceId to workspace-scoped requests', async () => {
    const { calls, restoreFetch } = installRecorder()

    try {
      const client = createClient({ workspaceId: 19744 })

      await client.browser.list({ windowName: 'test' })
      await client.proxy.create({
        checkChannel: 'IPRust.io',
        ipType: 'IPV4',
        protocol: 'SOCKS5',
        host: '127.0.0.1',
        port: '8000',
      })
      await client.account.list({ workspaceId: 2 })

      assert.equal(calls[0].url.pathname, '/browser/list_v3')
      assert.equal(calls[0].url.searchParams.get('workspaceId'), '19744')
      assert.equal(calls[0].url.searchParams.get('windowName'), 'test')

      assert.equal(calls[1].url.pathname, '/proxy/create')
      assert.deepEqual(calls[1].body, {
        workspaceId: 19744,
        checkChannel: 'IPRust.io',
        ipType: 'IPV4',
        protocol: 'SOCKS5',
        host: '127.0.0.1',
        port: '8000',
      })

      assert.equal(calls[2].url.pathname, '/account/list')
      assert.equal(calls[2].url.searchParams.get('workspaceId'), '2')
    }
    finally {
      restoreFetch()
    }
  })

  test('rejects requests when apikey is missing', async () => {
    const client = new RoxyOpenAPI({ baseUrl: 'http://127.0.0.1:50000' })

    await assert.rejects(
      client.health(),
      /apikey is required/,
    )
  })
})

describe('RoxyOpenAPI endpoint coverage', () => {
  const cases = [
    {
      name: 'GET /health',
      call: client => client.health(),
      method: 'GET',
      path: '/health',
    },
    {
      name: 'GET /browser/workspace',
      call: client => client.workspace.list({ page_index: 1, page_size: 15 }),
      method: 'GET',
      path: '/browser/workspace',
      query: { page_index: '1', page_size: '15' },
    },
    {
      name: 'GET /browser/account',
      call: client => client.browser.accounts({ workspaceId: 1, accountId: 2, page_index: 1, page_size: 15 }),
      method: 'GET',
      path: '/browser/account',
      query: { workspaceId: '1', accountId: '2', page_index: '1', page_size: '15' },
    },
    {
      name: 'GET /browser/label',
      call: client => client.browser.labels({ workspaceId: 1 }),
      method: 'GET',
      path: '/browser/label',
      query: { workspaceId: '1' },
    },
    {
      name: 'GET /browser/list_v3',
      call: client => client.browser.list({ workspaceId: 1, windowName: 'test', page_index: 1 }),
      method: 'GET',
      path: '/browser/list_v3',
      query: { workspaceId: '1', windowName: 'test', page_index: '1' },
    },
    {
      name: 'GET /browser/detail',
      call: client => client.browser.detail({ workspaceId: 1, dirId: 'dir-1' }),
      method: 'GET',
      path: '/browser/detail',
      query: { workspaceId: '1', dirId: 'dir-1' },
    },
    {
      name: 'POST /browser/create',
      call: client => client.browser.create({ workspaceId: 1, windowName: 'test' }),
      method: 'POST',
      path: '/browser/create',
      body: { workspaceId: 1, windowName: 'test' },
    },
    {
      name: 'POST /browser/mdf',
      call: client => client.browser.modify({ workspaceId: 1, dirId: 'dir-1', windowName: 'new' }),
      method: 'POST',
      path: '/browser/mdf',
      body: { workspaceId: 1, dirId: 'dir-1', windowName: 'new' },
    },
    {
      name: 'POST /browser/delete',
      call: client => client.browser.delete({ workspaceId: 1, dirIds: ['dir-1'], isSoftDelete: false }),
      method: 'POST',
      path: '/browser/delete',
      body: { workspaceId: 1, dirIds: ['dir-1'], isSoftDelete: false },
    },
    {
      name: 'POST /browser/open',
      call: client => client.browser.open({ workspaceId: 1, dirId: 'dir-1', args: ['--disable-audio-output'] }),
      method: 'POST',
      path: '/browser/open',
      body: { workspaceId: 1, dirId: 'dir-1', args: ['--disable-audio-output'] },
    },
    {
      name: 'POST /browser/close',
      call: client => client.browser.close({ dirId: 'dir-1' }),
      method: 'POST',
      path: '/browser/close',
      body: { dirId: 'dir-1' },
    },
    {
      name: 'POST /browser/random_env',
      call: client => client.browser.randomEnv({ workspaceId: 1, dirId: 'dir-1' }),
      method: 'POST',
      path: '/browser/random_env',
      body: { workspaceId: 1, dirId: 'dir-1' },
    },
    {
      name: 'POST /browser/clear_local_cache',
      call: client => client.browser.clearLocalCache({ dirIds: ['dir-1'], type: 'all' }),
      method: 'POST',
      path: '/browser/clear_local_cache',
      body: { dirIds: ['dir-1'], type: 'all' },
    },
    {
      name: 'POST /browser/clear_server_cache',
      call: client => client.browser.clearServerCache({ workspaceId: 1, dirIds: ['dir-1'] }),
      method: 'POST',
      path: '/browser/clear_server_cache',
      body: { workspaceId: 1, dirIds: ['dir-1'] },
    },
    {
      name: 'GET /browser/connection_info',
      call: client => client.browser.connectionInfo({ dirIds: 'dir-1,dir-2' }),
      method: 'GET',
      path: '/browser/connection_info',
      query: { dirIds: 'dir-1,dir-2' },
    },
    {
      name: 'GET /proxy/detect_channel',
      call: client => client.proxy.detectChannel(),
      method: 'GET',
      path: '/proxy/detect_channel',
    },
    {
      name: 'GET /proxy/list_merged',
      call: client => client.proxy.list({
        workspaceId: 1,
        type: 'available_list',
        pageIndex: 1,
        pageSize: 100,
        orderName: 'lastCountry',
        orderType: 'asc',
        proxyType: 'user-added',
        proxyBindStatus: 1,
        proxyAutoRenew: 1,
      }),
      method: 'GET',
      path: '/proxy/list_merged',
      query: {
        workspaceId: '1',
        type: 'available_list',
        orderName: 'lastCountry',
        orderType: 'asc',
        proxyType: '0',
        proxyBindStatus: '1',
        proxyAutoRenew: '1',
        page_index: '1',
        page_size: '100',
      },
    },
    {
      name: 'GET /proxy/list',
      call: client => client.proxy.userList({ workspaceId: 1, page_index: 1 }),
      method: 'GET',
      path: '/proxy/list',
      query: { workspaceId: '1', page_index: '1' },
    },
    {
      name: 'POST /proxy/create',
      call: client => client.proxy.create({ workspaceId: 1, checkChannel: 'IPRust.io', ipType: 'IPV4', protocol: 'SOCKS5', host: '127.0.0.1', port: '8000' }),
      method: 'POST',
      path: '/proxy/create',
      body: { workspaceId: 1, checkChannel: 'IPRust.io', ipType: 'IPV4', protocol: 'SOCKS5', host: '127.0.0.1', port: '8000' },
    },
    {
      name: 'POST /proxy/batch_create',
      call: client => client.proxy.batchCreate({ workspaceId: 1, checkChannel: 'IPRust.io', proxyList: [{ checkChannel: 'IPRust.io', ipType: 'IPV4', protocol: 'SOCKS5', host: '127.0.0.1', port: '8000' }] }),
      method: 'POST',
      path: '/proxy/batch_create',
      body: { workspaceId: 1, checkChannel: 'IPRust.io', proxyList: [{ checkChannel: 'IPRust.io', ipType: 'IPV4', protocol: 'SOCKS5', host: '127.0.0.1', port: '8000' }] },
    },
    {
      name: 'POST /proxy/detect',
      call: client => client.proxy.detect({ workspaceId: 1, id: 9 }),
      method: 'POST',
      path: '/proxy/detect',
      body: { workspaceId: 1, id: 9 },
    },
    {
      name: 'POST /proxy/modify',
      call: client => client.proxy.modify({ workspaceId: 1, id: 9, checkChannel: 'IPRust.io', ipType: 'IPV4', protocol: 'HTTP', host: '127.0.0.1', port: '8000' }),
      method: 'POST',
      path: '/proxy/modify',
      body: { workspaceId: 1, id: 9, checkChannel: 'IPRust.io', ipType: 'IPV4', protocol: 'HTTP', host: '127.0.0.1', port: '8000' },
    },
    {
      name: 'POST /proxy/delete',
      call: client => client.proxy.delete({ workspaceId: 1, ids: [9] }),
      method: 'POST',
      path: '/proxy/delete',
      body: { workspaceId: 1, ids: [9] },
    },
    {
      name: 'GET /proxy/bought_list',
      call: client => client.proxy.boughtList({ workspaceId: 1, type: 1, page_index: 1 }),
      method: 'GET',
      path: '/proxy/bought_list',
      query: { workspaceId: '1', type: '1', page_index: '1' },
    },
    {
      name: 'GET /account/list',
      call: client => client.account.list({ workspaceId: 1, page_index: 1, page_size: 15 }),
      method: 'GET',
      path: '/account/list',
      query: { workspaceId: '1', page_index: '1', page_size: '15' },
    },
    {
      name: 'POST /account/create',
      call: client => client.account.create({ workspaceId: 1, platformUrl: 'https://www.x.com/' }),
      method: 'POST',
      path: '/account/create',
      body: { workspaceId: 1, platformUrl: 'https://www.x.com/' },
    },
    {
      name: 'POST /account/batch_create',
      call: client => client.account.batchCreate({ workspaceId: 1, accountList: [{ platformUrl: 'https://www.x.com/' }] }),
      method: 'POST',
      path: '/account/batch_create',
      body: { workspaceId: 1, accountList: [{ platformUrl: 'https://www.x.com/' }] },
    },
    {
      name: 'POST /account/modify',
      call: client => client.account.modify({ workspaceId: 1, id: 3, platformUrl: 'https://www.x.com/' }),
      method: 'POST',
      path: '/account/modify',
      body: { workspaceId: 1, id: 3, platformUrl: 'https://www.x.com/' },
    },
    {
      name: 'POST /account/delete',
      call: client => client.account.delete({ workspaceId: 1, ids: [3] }),
      method: 'POST',
      path: '/account/delete',
      body: { workspaceId: 1, ids: [3] },
    },
  ]

  for (const item of cases) {
    test(item.name, async () => {
      const { calls, restoreFetch } = installRecorder()

      try {
        await item.call(createClient())

        assert.equal(calls.length, 1)
        assert.equal(calls[0].options.method, item.method)
        assert.equal(calls[0].url.pathname, item.path)
        assert.equal(calls[0].options.headers.token, 'secret-token')

        if (item.query) {
          assert.deepEqual(
            Object.fromEntries(calls[0].url.searchParams.entries()),
            item.query,
          )
        }
        else {
          assert.equal(calls[0].url.search, '')
        }

        if (item.body) {
          assert.deepEqual(calls[0].body, item.body)
        }
        else {
          assert.equal(calls[0].body, undefined)
        }
      }
      finally {
        restoreFetch()
      }
    })
  }
})
