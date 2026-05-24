import assert from 'node:assert/strict'
import { afterEach, describe, test } from 'node:test'
import {
  DEFAULT_CONFIG,
  request,
  resolveConfig,
} from '../lib/index.js'
import {
  captureEnv,
  createJsonResponse,
  installFetchMock,
  restoreEnv,
} from '../support/helpers.mjs'

const initialEnv = captureEnv()

afterEach(() => {
  restoreEnv(initialEnv)
})

describe('resolveConfig', () => {
  test('uses defaults when env is unset', () => {
    restoreEnv({
      ROXY_API_HOST: undefined,
      ROXY_API_KEY: undefined,
      ROXY_TIMEOUT: undefined,
    })

    assert.deepEqual(resolveConfig(), {
      apiHost: DEFAULT_CONFIG.apiHost,
      apiKey: '',
      timeout: DEFAULT_CONFIG.timeout,
    })
  })

  test('reads env overrides', () => {
    process.env.ROXY_API_HOST = 'http://127.0.0.1:60000/'
    process.env.ROXY_API_KEY = 'test-key'
    process.env.ROXY_TIMEOUT = '45000'

    assert.deepEqual(resolveConfig(), {
      apiHost: 'http://127.0.0.1:60000/',
      apiKey: 'test-key',
      timeout: 45000,
    })
  })
})

describe('request', () => {
  test('throws ConfigError when API key is missing', async () => {
    process.env.ROXY_API_HOST = 'http://127.0.0.1:50000'
    delete process.env.ROXY_API_KEY

    await assert.rejects(
      request('/health'),
      error => {
        assert.equal(error.name, 'ConfigError')
        assert.match(error.message, /API key is required/)
        return true
      },
    )
  })

  test('builds URL and headers from config', async () => {
    process.env.ROXY_API_HOST = 'http://127.0.0.1:50000/'
    process.env.ROXY_API_KEY = 'secret-token'
    process.env.ROXY_TIMEOUT = '30000'

    let calledUrl
    let calledOptions
    const restoreFetch = installFetchMock(async (url, options) => {
      calledUrl = url
      calledOptions = options
      return createJsonResponse({ code: 0, msg: 'ok', data: { healthy: true } })
    })

    try {
      const result = await request('/health', { method: 'GET' })
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

  test('throws detailed HTTP errors for non-ok responses', async () => {
    process.env.ROXY_API_HOST = 'http://127.0.0.1:50000'
    process.env.ROXY_API_KEY = 'secret-token'

    const restoreFetch = installFetchMock(async () =>
      createJsonResponse(
        { error: 'bad request' },
        { ok: false, status: 400, statusText: 'Bad Request' },
      ),
    )

    try {
      await assert.rejects(
        request('/health'),
        error => {
          assert.match(error.message, /HTTP 400: Bad Request/)
          assert.match(error.message, /bad request/)
          return true
        },
      )
    }
    finally {
      restoreFetch()
    }
  })
})
