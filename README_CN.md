# RoxyBrowser MCP Server 2.0

[English](README.md) | [中文](README_CN.md)

RoxyBrowser MCP Server 2.0 是一次破坏性重构。1.x 继续作为兼容维护线存在；2.0 面向嵌入式 MCP、固定 workspace/project 上下文、实例化配置和可单测 runtime 重新设计。

## 安装

```bash
npm install @roxybrowser/openapi@beta
```

## CLI 使用

```bash
roxybrowser-openapi-mcp --api-key "YOUR_API_KEY"
```

参数：

- `-H, --api-host <url>`：RoxyBrowser API 地址，默认 `http://127.0.0.1:50000`
- `-k, --api-key <key>`：RoxyBrowser API Key
- `-t, --timeout <ms>`：请求超时时间，默认 `30000`

也支持环境变量：`ROXY_API_HOST`、`ROXY_API_KEY`、`ROXY_TIMEOUT`。

## 嵌入式 MCP 使用

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

当传入 `context.workspaceId` 后，workspace 级工具的 MCP schema 不再暴露 `workspaceId`。runtime 会在调用时自动注入，并拒绝调用方传入冲突的 workspace。

固定 workspace 模式下，`workspace.list` 会被隐藏，并改为暴露 `project.list`。`project.list` 返回当前绑定 workspace 下的项目。

## SDK Client

```ts
import { RoxyClient } from '@roxybrowser/openapi'

const client = new RoxyClient({
  apiKey: 'YOUR_API_KEY',
  apiHost: 'http://127.0.0.1:50000',
})

const health = await client.request('/health')
```

## 工具命名

2.0 使用领域化工具名：

- `workspace.list`
- `project.list`（固定 workspace 模式）
- `health.check`
- `browser.list`
- `browser.create`（数组入参，支持创建一个或多个浏览器）
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
- `proxy.create`（数组入参，支持创建一个或多个代理）
- `proxy.detect`
- `proxy.modify`
- `proxy.delete`
- `account.list`
- `account.create`（数组入参，支持创建一个或多个账号）
- `account.modify`
- `account.delete`

## 开发

```bash
npm install
npm run build
npm test
```

测试使用 `node:test`，覆盖 runtime、client、MCP InMemoryTransport、工具 catalog 和真实 RoxyBrowser API 集成。

真实集成测试会通过 `dotenv/config` 加载 `.env`，需要配置：

```bash
ROXY_API_KEY="YOUR_API_KEY"
ROXY_API_HOST="http://127.0.0.1:50000"
ROXY_TEST_WORKSPACE_ID="123"
```
