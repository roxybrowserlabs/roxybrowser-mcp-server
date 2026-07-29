import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { RoxyCommerceClient } from '../../lib/index.js'
import { createJsonResponse, installFetchMock } from '../../support/helpers.mjs'

describe('RoxyCommerceClient', () => {
  test('presents browser profiles as ecommerce accounts', async () => {
    const calls = []
    const restoreFetch = installFetchMock(async (url, options) => {
      calls.push({ url: new URL(url), options, body: options.body ? JSON.parse(options.body) : undefined })
      if (url.includes('/browser/create')) {
        return createJsonResponse({ code: 0, msg: 'ok', data: { dirId: 'account-1' } })
      }
      return createJsonResponse({
        code: 0,
        msg: 'ok',
        data: {
          total: 1,
          rows: [{ dirId: 'account-1', windowName: 'Amazon Store A', projectId: 3 }],
        },
      })
    })

    try {
      const commerce = new RoxyCommerceClient({ apiKey: 'secret-token', workspaceId: 77 })
      const account = await commerce.accounts.create({
        name: 'Amazon Store A',
        projectId: 3,
        platform: {
          url: 'https://sellercentral.amazon.com',
          username: 'seller@example.com',
          password: 'secret',
        },
      })

      assert.equal(calls[0].url.pathname, '/browser/create')
      assert.equal(calls[0].body.windowName, 'Amazon Store A')
      assert.deepEqual(calls[0].body.defaultOpenUrl, ['https://sellercentral.amazon.com'])
      assert.equal(calls[0].body.windowPlatformList[0].platformUserName, 'seller@example.com')
      assert.equal(account.id, 'account-1')
      assert.equal(account.name, 'Amazon Store A')
    }
    finally {
      restoreFetch()
    }
  })
})
