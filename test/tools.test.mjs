import assert from 'node:assert/strict'
import { afterEach, describe, test } from 'node:test'
import {
  healthCheck,
  listWorkspaces,
} from '../lib/index.js'
import {
  captureEnv,
  createJsonResponse,
  getTextContent,
  installFetchMock,
  restoreEnv,
} from '../support/helpers.mjs'

const initialEnv = captureEnv()

afterEach(() => {
  restoreEnv(initialEnv)
})

describe('tool handlers', () => {
  test('listWorkspaces formats workspace and project names', async () => {
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
              id: 7,
              workspaceName: 'Growth',
              project_details: [
                { projectId: 11, projectName: 'Alpha' },
                { projectId: 12, projectName: 'Beta' },
              ],
            },
          ],
        },
      }),
    )

    try {
      const result = await listWorkspaces.handle({ pageIndex: 1, pageSize: 5 })
      const text = getTextContent(result)

      assert.match(text, /Found 1 workspaces/)
      assert.match(text, /\*\*Growth\*\* \(ID: 7\)/)
      assert.match(text, /Alpha \(ID: 11\)/)
      assert.match(text, /Beta \(ID: 12\)/)
    }
    finally {
      restoreFetch()
    }
  })

  test('healthCheck reports healthy status', async () => {
    process.env.ROXY_API_HOST = 'http://127.0.0.1:50000'
    process.env.ROXY_API_KEY = 'secret-token'

    const restoreFetch = installFetchMock(async () =>
      createJsonResponse({ code: 0, msg: 'ok' }),
    )

    try {
      const result = await healthCheck.handle()
      const text = getTextContent(result)

      assert.match(text, /Server is healthy/)
      assert.match(text, /running and reachable/)
    }
    finally {
      restoreFetch()
    }
  })

  test('healthCheck reports server errors', async () => {
    process.env.ROXY_API_HOST = 'http://127.0.0.1:50000'
    process.env.ROXY_API_KEY = 'secret-token'

    const restoreFetch = installFetchMock(async () =>
      createJsonResponse({ code: 1, msg: 'maintenance mode' }),
    )

    try {
      const result = await healthCheck.handle()
      const text = getTextContent(result)

      assert.match(text, /Server health check failed/)
      assert.match(text, /maintenance mode/)
    }
    finally {
      restoreFetch()
    }
  })

  test('healthCheck reports connection failures', async () => {
    process.env.ROXY_API_HOST = 'http://127.0.0.1:50000'
    process.env.ROXY_API_KEY = 'secret-token'

    const restoreFetch = installFetchMock(async () => {
      throw new Error('connect ECONNREFUSED 127.0.0.1:50000')
    })

    try {
      const result = await healthCheck.handle()
      const text = getTextContent(result)

      assert.match(text, /Server is unavailable/)
      assert.match(text, /ECONNREFUSED/)
    }
    finally {
      restoreFetch()
    }
  })
})
