import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { RoxyApiClient, RoxyApiConfigError, RoxyApiHttpError } from '../../lib/index.js'
import { appendQuery, withDefaultWorkspace } from '../../lib/api/transport.js'
import { toPage, toPageRequest } from '../../lib/sdk/shared/pagination.js'
import { unwrapData } from '../../lib/sdk/shared/result.js'
import { createJsonResponse, installFetchMock } from '../../support/helpers.mjs'

function installRecorder(body = { code: 0, msg: 'success', data: {} }) {
  const calls = []
  const restoreFetch = installFetchMock(async (url, options) => {
    calls.push({
      url: new URL(url),
      options,
      body: options.body ? JSON.parse(options.body) : undefined,
    })
    return createJsonResponse(body)
  })
  return { calls, restoreFetch }
}

describe('RoxyApiClient', () => {
  test('sends token headers and default workspaceId on GET requests', async () => {
    const { calls, restoreFetch } = installRecorder({ code: 0, msg: 'ok', data: { total: 0, rows: [] } })
    try {
      const api = new RoxyApiClient({
        apiKey: 'secret-token',
        baseUrl: 'http://127.0.0.1:50000/',
        workspaceId: 19744,
      })

      await api.browser.list({ windowName: 'alpha', page_index: 2 })

      assert.equal(calls[0].url.toString(), 'http://127.0.0.1:50000/browser/list_v3?windowName=alpha&page_index=2&workspaceId=19744')
      assert.equal(calls[0].options.method, 'GET')
      assert.equal(calls[0].options.headers.token, 'secret-token')
    }
    finally {
      restoreFetch()
    }
  })

  test('sends JSON bodies on POST requests', async () => {
    const { calls, restoreFetch } = installRecorder({ code: 0, msg: 'ok', data: { dirId: 'profile-1' } })
    try {
      const api = new RoxyApiClient({ apiKey: 'secret-token', workspaceId: 7 })
      await api.browser.create({ windowName: 'alpha' })

      assert.equal(calls[0].url.pathname, '/browser/create')
      assert.equal(calls[0].options.method, 'POST')
      assert.deepEqual(calls[0].body, { windowName: 'alpha', workspaceId: 7 })
    }
    finally {
      restoreFetch()
    }
  })

  test('throws typed config and HTTP errors', async () => {
    await assert.rejects(
      new RoxyApiClient().health(),
      error => {
        assert.ok(error instanceof RoxyApiConfigError)
        assert.match(error.message, /API key is required/)
        return true
      },
    )

    const restoreFetch = installFetchMock(async () =>
      createJsonResponse({ error: 'bad request' }, { ok: false, status: 400, statusText: 'Bad Request' }),
    )
    try {
      await assert.rejects(
        new RoxyApiClient({ apiKey: 'secret-token' }).health(),
        error => {
          assert.ok(error instanceof RoxyApiHttpError)
          assert.equal(error.status, 400)
          assert.match(error.message, /HTTP 400: Bad Request/)
          return true
        },
      )
    }
    finally {
      restoreFetch()
    }
  })

  test('covers the 3.0 raw endpoint surface with default workspace injection', async () => {
    const { calls, restoreFetch } = installRecorder({ code: 0, msg: 'ok', data: { total: 0, rows: [], dirId: 'profile-1', platform_id: 9 } })
    try {
      const api = new RoxyApiClient({ apiKey: 'secret-token', workspaceId: 19744 })

      await api.workspace.list({ page_index: 1 })
      await api.workspace.projects({ page_index: 1 })
      await api.browser.detail({ dirId: 'profile-1' })
      await api.browser.modify({ dirId: 'profile-1', windowName: 'Alpha' })
      await api.browser.open({ dirId: 'profile-1', forceOpen: true })
      await api.browser.close({ dirId: 'profile-1' })
      await api.browser.delete({ dirIds: ['profile-1'] })
      await api.browser.clearLocalCache({ dirIds: ['profile-1'], type: 'cookie' })
      await api.browser.clearServerCache({ dirIds: ['profile-1'] })
      await api.browser.randomEnv({ dirId: 'profile-1' })
      await api.browser.connectionInfo({ dirIds: 'profile-1' })
      await api.browser.labels({})
      await api.browser.accounts({ page_index: 1 })
      await api.proxy.detectChannels()
      await api.proxy.listMerged({ page_index: 1 })
      await api.proxy.detail({ id: 1 })
      await api.proxy.create({ host: '127.0.0.1', port: '1080' })
      await api.proxy.batchCreate({ proxyList: [{ host: '127.0.0.1' }] })
      await api.proxy.detect({ id: 1 })
      await api.proxy.modify({ id: 1, remark: 'new' })
      await api.proxy.delete({ ids: [1] })
      await api.account.list({ page_index: 1 })
      await api.account.create({ platformUrl: 'https://example.com' })
      await api.account.batchCreate({ accountList: [{ platformUrl: 'https://example.com' }] })
      await api.account.modify({ id: 9, platformUserName: 'user' })
      await api.account.delete({ ids: [9] })

      const byPath = calls.map(call => call.url.pathname)
      assert.deepEqual(byPath, [
        '/browser/workspace',
        '/project/list',
        '/browser/detail',
        '/browser/mdf',
        '/browser/open',
        '/browser/close',
        '/browser/delete',
        '/browser/clear_local_cache',
        '/browser/clear_server_cache',
        '/browser/random_env',
        '/browser/connection_info',
        '/browser/label',
        '/browser/account',
        '/proxy/detect_channel',
        '/proxy/list_merged',
        '/proxy/detail',
        '/proxy/create',
        '/proxy/batch_create',
        '/proxy/detect',
        '/proxy/modify',
        '/proxy/delete',
        '/account/list',
        '/account/create',
        '/account/batch_create',
        '/account/modify',
        '/account/delete',
      ])
      assert.equal(calls.find(call => call.url.pathname === '/proxy/create').body.workspaceId, 19744)
      assert.equal(calls.find(call => call.url.pathname === '/project/list').url.searchParams.get('workspaceId'), '19744')
      assert.equal(calls.find(call => call.url.pathname === '/browser/close').body.workspaceId, undefined)
    }
    finally {
      restoreFetch()
    }
  })

  test('normalizes query params and workspace defaults without mutating API intent', () => {
    const url = new URL('http://127.0.0.1:50000/browser/list_v3')
    appendQuery(url)
    appendQuery(url, { ids: [1, 2], empty: undefined, none: null, name: 'Alpha' })

    assert.equal(url.searchParams.get('ids'), '1,2')
    assert.equal(url.searchParams.get('name'), 'Alpha')
    assert.equal(url.searchParams.has('empty'), false)
    assert.deepEqual(withDefaultWorkspace({ workspaceId: 9, name: 'Alpha' }, 77), { workspaceId: 9, name: 'Alpha' })
    assert.deepEqual(withDefaultWorkspace({ workspaceId: null, name: 'Alpha' }, 77), { workspaceId: 77, name: 'Alpha' })
    assert.deepEqual(toPageRequest(), { page_index: undefined, page_size: undefined })
    assert.deepEqual(toPage(undefined), { total: 0, rows: [], page: 1, pageSize: 15 })
    assert.throws(() => unwrapData({ code: 500, msg: '' }), /Roxy API request failed with code 500/)
  })
})
