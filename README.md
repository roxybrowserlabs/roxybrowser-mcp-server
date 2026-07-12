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

In fixed workspace mode, `roxy_workspace_list` is hidden and `roxy_project_list` is exposed instead. `roxy_project_list` returns projects under the bound workspace.

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

Public MCP tool names use OpenAI-safe underscores:

- `roxy_workspace_list`
- `roxy_project_list` (fixed workspace mode)
- `roxy_health_check`
- `roxy_browser_list`
- `roxy_browser_create` (array input; supports one or many browsers)
- `roxy_browser_open`
- `roxy_browser_close`
- `roxy_browser_update`
- `roxy_browser_delete`
- `roxy_browser_detail`
- `roxy_browser_connection_info`
- `roxy_browser_clear_local_cache`
- `roxy_browser_clear_server_cache`
- `roxy_browser_list_labels`
- `roxy_proxy_list`
- `roxy_proxy_detail`
- `roxy_proxy_create` (array input; supports one or many proxies)
- `roxy_proxy_detect`
- `roxy_proxy_modify`
- `roxy_proxy_delete`
- `roxy_account_list`
- `roxy_account_create` (array input; supports one or many accounts)
- `roxy_account_modify`
- `roxy_account_delete`

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
