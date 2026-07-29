# RoxyBrowser OpenAPI 3.0

[English](README.md) | [中文](README_CN.md)

RoxyBrowser OpenAPI 3.0 是一次破坏性重写。新的结构把底层 RoxyBrowser 本地 API、对外 SDK、MCP 预设彻底拆开，后端接口名、SDK 方法名、MCP 工具名不再混在一起。

## 安装

```bash
npm install @roxybrowser/openapi
```

## CLI 使用

浏览器 Profile 模式：

```bash
roxybrowser-mcp --api-key "YOUR_API_KEY" --workspace-id 19744
```

电商账号模式：

```bash
roxycommerce-mcp --api-key "YOUR_API_KEY" --workspace-id 19744
```

参数：

- `-H, --api-host <url>`：RoxyBrowser API 地址，默认 `http://127.0.0.1:50000`
- `-k, --api-key <key>`：RoxyBrowser API Key
- `-w, --workspace-id <id>`：默认 workspace ID，会注入到需要 workspace 的请求
- `-t, --timeout <ms>`：请求超时时间，默认 `30000`

也支持环境变量：`ROXY_API_HOST`、`ROXY_API_KEY`、`ROXY_TIMEOUT`。

## SDK 使用

浏览器产品 SDK：

```ts
import { RoxyBrowserClient } from '@roxybrowser/openapi'

const roxy = new RoxyBrowserClient({
  apiKey: 'YOUR_API_KEY',
  apiHost: 'http://127.0.0.1:50000',
  workspaceId: 19744,
})

const profiles = await roxy.profiles.list({ page: 1, pageSize: 20 })
const opened = await roxy.profiles.open(profiles.rows[0].id, { force: true })
```

电商产品 SDK：

```ts
import { RoxyCommerceClient } from '@roxybrowser/openapi'

const commerce = new RoxyCommerceClient({
  apiKey: 'YOUR_API_KEY',
  workspaceId: 19744,
})

const accounts = await commerce.accounts.list({ keyword: 'Amazon' })
await commerce.accounts.open(accounts.rows[0].id)
```

如果需要直接调用接近后端接口形态的能力，可以使用低层 `RoxyApiClient`：

```ts
import { RoxyApiClient } from '@roxybrowser/openapi'

const api = new RoxyApiClient({ apiKey: 'YOUR_API_KEY', workspaceId: 19744 })
const raw = await api.proxy.listMerged({ page_index: 1, page_size: 20 })
```

## 嵌入式 MCP 使用

```ts
import { createRoxyBrowserMcpServer, createRoxyCommerceMcpServer } from '@roxybrowser/openapi'

const browserServer = createRoxyBrowserMcpServer({
  roxy: { apiKey: 'YOUR_API_KEY', workspaceId: 19744 },
})

const commerceServer = createRoxyCommerceMcpServer({
  roxy: { apiKey: 'YOUR_API_KEY', workspaceId: 19744 },
})
```

## 对外 MCP 工具名

浏览器模式暴露 27 个 profile 语言工具：

- `roxy_workspace_list`
- `roxy_project_list`
- `roxy_label_list`
- `roxy_profile_list`
- `roxy_profile_get`
- `roxy_profile_create`
- `roxy_profile_update`
- `roxy_profile_open`
- `roxy_profile_close`
- `roxy_profile_delete`
- `roxy_profile_connection_info`
- `roxy_profile_randomize_fingerprint`
- `roxy_profile_clear_local_cache`
- `roxy_profile_clear_server_cache`
- `roxy_proxy_list`
- `roxy_proxy_get`
- `roxy_proxy_create`
- `roxy_proxy_create_many`
- `roxy_proxy_update`
- `roxy_proxy_delete`
- `roxy_proxy_detect`
- `roxy_proxy_detect_channels`
- `roxy_platform_account_list`
- `roxy_platform_account_create`
- `roxy_platform_account_create_many`
- `roxy_platform_account_update`
- `roxy_platform_account_delete`

电商模式暴露 20 个 account 语言工具，底层仍然复用浏览器 profile 接口：

- `roxy_account_list`
- `roxy_account_get`
- `roxy_account_create`
- `roxy_account_update`
- `roxy_account_open`
- `roxy_account_close`
- `roxy_account_delete`
- `roxy_proxy_list`
- `roxy_proxy_get`
- `roxy_proxy_create`
- `roxy_proxy_create_many`
- `roxy_proxy_update`
- `roxy_proxy_delete`
- `roxy_proxy_detect`
- `roxy_proxy_detect_channels`
- `roxy_platform_credential_list`
- `roxy_platform_credential_create`
- `roxy_platform_credential_create_many`
- `roxy_platform_credential_update`
- `roxy_platform_credential_delete`

每个 MCP 工具都会保留稳定的 `operationId` 和底层 RoxyBrowser `endpoint` 作为排查 metadata。

## 架构

3.0 源码按职责拆分：

- `src/api`：底层 RoxyBrowser HTTP API client
- `src/sdk`：对外 SDK client
- `src/domains/browser`：浏览器 profile、proxy、workspace、platform account 领域
- `src/domains/commerce`：电商 account、proxy、platform credential 领域
- `src/mcp/runtime`：可复用 MCP runtime
- `src/mcp/presets/browser`：浏览器模式 MCP 预设
- `src/mcp/presets/commerce`：电商模式 MCP 预设
- `src/cli`：不同产品形态的 CLI 入口

完整设计见 [docs/architecture-3.0.md](docs/architecture-3.0.md)。

## 开发

```bash
npm install
npm run build
npm test
npm run coverage
```

`npm run coverage` 会先构建，再运行 3.0 单元测试，并强制 API、SDK、领域层和 MCP 层的行覆盖率、分支覆盖率、函数覆盖率都达到 90%。
