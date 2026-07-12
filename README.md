# RoxyBrowser MCP Server 2.0

[English](README.md) | [中文](README_CN.md)

RoxyBrowser MCP Server 2.0 is a breaking redesign of the RoxyBrowser OpenAPI MCP package. The 1.x line remains available for compatibility maintenance; 2.0 is built for embedded MCP usage, fixed workspace/project context, instance-based configuration, and unit-tested runtime behavior.

## Install

```bash
npm install @roxybrowser/openapi@beta
```

## CLI Usage

```bash
roxybrowser-openapi-mcp --api-key "YOUR_API_KEY"
```

Options:

- `-H, --api-host <url>`: RoxyBrowser API base URL. Default: `http://127.0.0.1:50000`
- `-k, --api-key <key>`: RoxyBrowser API key.
- `-t, --timeout <ms>`: request timeout. Default: `30000`

Environment variables are also supported: `ROXY_API_HOST`, `ROXY_API_KEY`, `ROXY_TIMEOUT`.

## Embedded MCP Usage

```ts
import { createRoxyMcpServer } from '@roxybrowser/openapi'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'

const server = createRoxyMcpServer({
  roxy: {
    apiKey: 'YOUR_API_KEY',
    apiHost: 'http://127.0.0.1:50000',
  },
  context: {
    workspaceId: 123,
  },
})

const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
await server.connect(serverTransport)
```

When `context.workspaceId` is provided, workspace-scoped tools no longer expose `workspaceId` in their public MCP schema. The runtime injects it into tool calls automatically and rejects conflicting caller-provided values.

In fixed workspace mode, `workspace.list` is hidden and `project.list` is exposed instead. `project.list` returns projects under the bound workspace.

## SDK Client

```ts
import { RoxyClient } from '@roxybrowser/openapi'

const client = new RoxyClient({
  apiKey: 'YOUR_API_KEY',
  apiHost: 'http://127.0.0.1:50000',
})

const health = await client.request('/health')
```

## Tool Names

2.0 uses domain-style tool names:

- `workspace.list`
- `project.list` (fixed workspace mode)
- `health.check`
- `browser.list`
- `browser.create` (array input; supports one or many browsers)
- `browser.open`
- `browser.close`
- `browser.update`
- `browser.delete`
- `browser.detail`
- `browser.connection_info`
- `browser.clear_local_cache`
- `browser.clear_server_cache`
- `browser.list_labels`
- `proxy.list`
- `proxy.detail`
- `proxy.create` (array input; supports one or many proxies)
- `proxy.detect`
- `proxy.modify`
- `proxy.delete`
- `account.list`
- `account.create` (array input; supports one or many accounts)
- `account.modify`
- `account.delete`

## Development

```bash
npm install
npm run build
npm test
```

The test suite uses `node:test` and includes runtime, client, MCP InMemoryTransport, tool catalog coverage, and real RoxyBrowser API integration coverage.

Real integration tests load `.env` through `dotenv/config` and require:

```bash
ROXY_API_KEY="YOUR_API_KEY"
ROXY_API_HOST="http://127.0.0.1:50000"
ROXY_TEST_WORKSPACE_ID="123"
```
