import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  RoxyClient,
  createRoxyClientConfig,
} from '../lib/index.js'
import {
  createJsonResponse,
  installFetchMock,
} from '../support/helpers.mjs'

describe('RoxyClient', () => {
  test('builds request URL and token headers from instance config', async () => {
    let calledUrl
    let calledOptions

    const restoreFetch = installFetchMock(async (url, options) => {
      calledUrl = url
      calledOptions = options
      return createJsonResponse({ code: 0, msg: 'ok', data: { healthy: true } })
    })

    try {
      const client = new RoxyClient({
        apiHost: 'http://127.0.0.1:50000/',
        apiKey: 'secret-token',
        timeout: 30000,
      })

      const result = await client.request('/health', { method: 'GET' })

      assert.equal(calledUrl, 'http://127.0.0.1:50000/health')
      assert.equal(calledOptions.method, 'GET')
      assert.equal(calledOptions.headers.token, 'secret-token')
      assert.equal(calledOptions.headers['Content-Type'], 'application/json')
      assert.deepEqual(result, { code: 0, msg: 'ok', data: { healthy: true } })
    }
    finally {
      restoreFetch()
    }
  })

  test('rejects requests when apiKey is missing', async () => {
    const client = new RoxyClient({
      apiHost: 'http://127.0.0.1:50000',
      apiKey: '',
      timeout: 30000,
    })

    await assert.rejects(
      client.request('/health'),
      error => {
        assert.equal(error.name, 'ConfigError')
        assert.match(error.message, /API key is required/)
        return true
      },
    )
  })
})

describe('createRoxyClientConfig', () => {
  test('normalizes partial config with defaults', () => {
    assert.deepEqual(
      createRoxyClientConfig({ apiKey: 'secret-token' }),
      {
        apiHost: 'http://127.0.0.1:50000',
        apiKey: 'secret-token',
        timeout: 30000,
      },
    )
  })
})
