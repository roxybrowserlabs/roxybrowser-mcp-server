import assert from 'node:assert/strict'

const ROXY_ENV_KEYS = ['ROXY_API_HOST', 'ROXY_API_KEY', 'ROXY_TIMEOUT']

export function captureEnv() {
  return Object.fromEntries(ROXY_ENV_KEYS.map(key => [key, process.env[key]]))
}

export function restoreEnv(snapshot) {
  for (const key of ROXY_ENV_KEYS) {
    const value = snapshot[key]
    if (value === undefined) {
      delete process.env[key]
    }
    else {
      process.env[key] = value
    }
  }
}

export function installFetchMock(impl) {
  const originalFetch = globalThis.fetch
  globalThis.fetch = impl
  return () => {
    globalThis.fetch = originalFetch
  }
}

export function createJsonResponse(body, init = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: init.statusText ?? 'OK',
    json: async () => body,
    text: async () => JSON.stringify(body),
  }
}

export async function withConnectedClient({ Client, InMemoryTransport, RoxyBrowserMCPServer }) {
  const server = new RoxyBrowserMCPServer()
  const client = new Client(
    { name: 'roxybrowser-openapi-test-client', version: '1.0.0' },
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

export function getTextContent(result) {
  assert.ok(Array.isArray(result.content), 'result.content must be an array')
  const entry = result.content.find(item => item.type === 'text')
  assert.ok(entry, 'result must contain a text content block')
  return entry.text
}
