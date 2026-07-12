import assert from 'node:assert/strict'
import { afterEach, describe, test } from 'node:test'
import {
  createProxies,
  detectProxy,
  healthCheck,
  listWorkspaces,
  modifyProxy,
  proxyDetail,
  proxyList,
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

      assert.match(text, /Found 1 workspace\(s\)/)
      assert.match(text, /\*\*Workspace:\*\* Growth → workspaceId: \*\*7\*\*/)
      assert.match(text, /Alpha → projectId: \*\*11\*\*/)
      assert.match(text, /Beta → projectId: \*\*12\*\*/)
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

  test('proxyList labels failed checks as historical instead of current unusable status', async () => {
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
              id: 101,
              remark: 'Needs refresh',
              dataType: 'proxyModule',
              checkStatus: 2,
              protocol: 'HTTP',
              ipType: 'IPV4',
              bindCount: 0,
              checkChannel: 'IPRust.io',
              host: '1.2.3.4',
              port: '8080',
              lastCountry: 'US',
              lastCity: 'Los Angeles',
            },
          ],
        },
      }),
    )

    try {
      const result = await proxyList.handle({ workspaceId: 7, pageIndex: 1, pageSize: 5 })
      const text = getTextContent(result)

      assert.match(text, /last check failed/i)
      assert.match(text, /historical/i)
      assert.match(text, /proxy\.detect/)
      assert.doesNotMatch(text, /❌ unavailable/)
      assert.doesNotMatch(text, /unusable proxy/i)
    }
    finally {
      restoreFetch()
    }
  })

  test('proxyDetail explains check status is historical and recommends proxy.detect', async () => {
    process.env.ROXY_API_HOST = 'http://127.0.0.1:50000'
    process.env.ROXY_API_KEY = 'secret-token'

    const restoreFetch = installFetchMock(async () =>
      createJsonResponse({
        code: 0,
        msg: 'ok',
        data: {
          id: 101,
          workspaceId: 7,
          dataType: 'proxyModule',
          checkStatus: 2,
          checkChannel: 'IPRust.io',
          checkTime: '2026-07-12 09:30:00',
          protocol: 'HTTP',
          host: '1.2.3.4',
          port: '8080',
          ipType: 'IPV4',
          lastIp: '1.2.3.4',
          lastCountry: 'US',
          lastCity: 'Los Angeles',
        },
      }),
    )

    try {
      const result = await proxyDetail.handle({ workspaceId: 7, id: 101 })
      const text = getTextContent(result)

      assert.match(text, /last check failed/i)
      assert.match(text, /historical/i)
      assert.match(text, /proxy\.detect/)
      assert.doesNotMatch(text, /❌ unavailable/)
    }
    finally {
      restoreFetch()
    }
  })

  test('detectProxy labels returned status as a fresh detection result', async () => {
    process.env.ROXY_API_HOST = 'http://127.0.0.1:50000'
    process.env.ROXY_API_KEY = 'secret-token'

    const restoreFetch = installFetchMock(async () =>
      createJsonResponse({
        code: 0,
        msg: 'ok',
        data: {
          checkStatus: 2,
          lastIp: '1.2.3.4',
          lastCountry: 'US',
          lastCity: 'Los Angeles',
          timezone: 'America/Los_Angeles',
        },
      }),
    )

    try {
      const result = await detectProxy.handle({ workspaceId: 7, id: 101 })
      const text = getTextContent(result)

      assert.match(text, /Fresh proxy detection/i)
      assert.match(text, /failed/i)
    }
    finally {
      restoreFetch()
    }
  })

  test('createProxies and modifyProxy tell agents to run proxy.detect before judging availability', async () => {
    process.env.ROXY_API_HOST = 'http://127.0.0.1:50000'
    process.env.ROXY_API_KEY = 'secret-token'

    const restoreFetch = installFetchMock(async () =>
      createJsonResponse({ code: 0, msg: 'ok' }),
    )

    try {
      const createResult = await createProxies.handle({
        workspaceId: 7,
        proxyList: [{ protocol: 'HTTP', host: '1.2.3.4', port: '8080' }],
      })
      const modifyResult = await modifyProxy.handle({
        workspaceId: 7,
        id: 101,
        protocol: 'HTTP',
      })

      assert.match(getTextContent(createResult), /proxy\.detect/)
      assert.match(getTextContent(createResult), /before judging availability/i)
      assert.match(getTextContent(modifyResult), /proxy\.detect/)
      assert.match(getTextContent(modifyResult), /before judging availability/i)
    }
    finally {
      restoreFetch()
    }
  })
})
