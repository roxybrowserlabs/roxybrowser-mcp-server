import assert from 'node:assert/strict'
import { afterEach, describe, test } from 'node:test'
import {
  createProxies,
  detectProxy,
  healthCheck,
  listBrowsers,
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

    let calledUrl
    const restoreFetch = installFetchMock(async (url) => {
      calledUrl = url
      return createJsonResponse({
        code: 0,
        msg: 'ok',
        data: {
          total: 0,
          rows: [],
        },
      })
    })

    try {
      const result = await healthCheck.handle()
      const text = getTextContent(result)

      assert.match(calledUrl, /\/browser\/workspace\?page_index=1&page_size=1/)
      assert.match(text, /Server is healthy/)
      assert.match(text, /API is running and reachable/)
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
      assert.match(text, /roxy_proxy_detect/)
      assert.doesNotMatch(text, /❌ unavailable/)
      assert.doesNotMatch(text, /unusable proxy/i)
    }
    finally {
      restoreFetch()
    }
  })

  test('listBrowsers exposes partial pagination semantics with public hints', async () => {
    process.env.ROXY_API_HOST = 'http://127.0.0.1:50000'
    process.env.ROXY_API_KEY = 'secret-token'

    const restoreFetch = installFetchMock(async () =>
      createJsonResponse({
        code: 0,
        msg: 'ok',
        data: {
          total: 1018,
          rows: [
            {
              workspaceName: 'Roxy',
              windowSortNum: 2549,
              windowName: '6.25 box account',
              dirId: 'dir-2549',
              coreType: 'Chrome',
              coreVersion: '140',
              os: 'Windows',
              osVersion: '11',
            },
          ],
        },
      }),
    )

    try {
      const result = await listBrowsers.handle({ workspaceId: 5052, pageIndex: 36, pageSize: 15 })
      const text = getTextContent(result)

      assert.match(text, /Pagination:/)
      assert.match(text, /currentPage: 36/)
      assert.match(text, /totalItems: 1018/)
      assert.match(text, /hasPreviousPage: true/)
      assert.match(text, /previousPageHint: Call roxy_browser_list with pageIndex=35/)
      assert.match(text, /hasNextPage: true/)
      assert.match(text, /nextPageHint: Call roxy_browser_list with pageIndex=37/)
      assert.match(text, /PARTIAL_PAGE_ONLY/)
      assert.match(text, /sort: windowSortNum desc/)
      assert.match(text, /exactLookupHint: windowSortNum is a browser serial-number filter/)
      assert.match(text, /not the current browser total count/)
      assert.doesNotMatch(text, /windowSortNum="2550"/)
      assert.doesNotMatch(text, /roxy_list_browsers/)
      assert.equal(result.structuredContent, undefined)
      assert.equal(result._meta, undefined)
    }
    finally {
      restoreFetch()
    }
  })

  test('healthCheck reports connection failures from the real API probe', async () => {
    process.env.ROXY_API_HOST = 'http://127.0.0.1:50000'
    process.env.ROXY_API_KEY = 'secret-token'

    const restoreFetch = installFetchMock(async () => {
      throw new Error('fetch failed')
    })

    try {
      const result = await healthCheck.handle()
      const text = getTextContent(result)

      assert.match(text, /Server is unavailable/)
      assert.match(text, /fetch failed/)
    }
    finally {
      restoreFetch()
    }
  })

  test('listBrowsers normalizes prefixed serial numbers for exact lookup', async () => {
    process.env.ROXY_API_HOST = 'http://127.0.0.1:50000'
    process.env.ROXY_API_KEY = 'secret-token'

    let calledUrl
    const restoreFetch = installFetchMock(async (url) => {
      calledUrl = url
      return createJsonResponse({
        code: 0,
        msg: 'ok',
        data: {
          total: 0,
          rows: [],
        },
      })
    })

    try {
      const result = await listBrowsers.handle({
        workspaceId: 5052,
        windowSortNum: 'ROX-2550',
        pageIndex: 1,
        pageSize: 15,
      })
      const text = getTextContent(result)

      assert.match(calledUrl, /windowSortNum=2550/)
      assert.match(text, /No browser matched windowSortNum=2550/)
      assert.doesNotMatch(text, /No browsers found in workspace/)
      assert.equal(result.structuredContent, undefined)
      assert.equal(result._meta, undefined)
    }
    finally {
      restoreFetch()
    }
  })

  test('listBrowsers distinguishes page out of range from empty workspace', async () => {
    process.env.ROXY_API_HOST = 'http://127.0.0.1:50000'
    process.env.ROXY_API_KEY = 'secret-token'

    const restoreFetch = installFetchMock(async () =>
      createJsonResponse({
        code: 0,
        msg: 'ok',
        data: {
          total: 1018,
          rows: [],
        },
      }),
    )

    try {
      const result = await listBrowsers.handle({ workspaceId: 5052, pageIndex: 9999, pageSize: 15 })
      const text = getTextContent(result)

      assert.match(text, /No browsers found on page 9999/)
      assert.match(text, /PAGE_OUT_OF_RANGE/)
      assert.match(text, /recoveryHint: Call roxy_browser_list with pageIndex=68/)
      assert.doesNotMatch(text, /No browsers found in workspace 5052/)
      assert.equal(result.structuredContent, undefined)
      assert.equal(result._meta, undefined)
    }
    finally {
      restoreFetch()
    }
  })

  test('proxyDetail explains check status is historical and recommends roxy_proxy_detect', async () => {
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
      assert.match(text, /roxy_proxy_detect/)
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

  test('createProxies and modifyProxy tell agents to run roxy_proxy_detect before judging availability', async () => {
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

      assert.match(getTextContent(createResult), /roxy_proxy_detect/)
      assert.match(getTextContent(createResult), /before judging availability/i)
      assert.match(getTextContent(modifyResult), /roxy_proxy_detect/)
      assert.match(getTextContent(modifyResult), /before judging availability/i)
    }
    finally {
      restoreFetch()
    }
  })
})
