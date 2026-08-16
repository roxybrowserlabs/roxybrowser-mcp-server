# RoxyBrowser OpenAPI 3.0

[English](README.md) | [中文](README_CN.md)

RoxyBrowser OpenAPI 3.0 是一次破坏性重写。新的结构把底层 RoxyBrowser 本地 API、对外 SDK、MCP 预设彻底拆开，后端接口名、SDK 方法名、MCP 工具名不再混在一起。

## 安装

```bash
pnpm add @roxybrowser/openapi
```

## CLI 使用

浏览器 Profile 模式：

```bash
roxybrowser-openapi-mcp --api-key "YOUR_API_KEY" --workspace-id 19744
```

也可以直接用 `npx` 运行已发布的 beta 版本：

```bash
npx -y @roxybrowser/openapi@beta roxybrowser-openapi-mcp --api-key "YOUR_API_KEY" --workspace-id 19744
```

同一个 CLI 也可以快速调用 SDK 方法。每个方法参数都会优先按 JSON 解析，解析失败时按字符串传入：

```bash
npx -y @roxybrowser/openapi@beta sdk profiles.list '{"page":1,"pageSize":20}' \
  --api-key "YOUR_API_KEY" --workspace-id 19744

npx -y @roxybrowser/openapi@beta sdk profiles.open profile-1 '{"forceOpen":true}' \
  --api-key "YOUR_API_KEY" --workspace-id 19744
```

如果 RoxyBrowser 已经有接口，但 SDK 还没有封装，可以用 raw API 调试命令：

```bash
npx -y @roxybrowser/openapi@beta api POST /browser/new_feature '{"dirId":"profile-1"}' \
  --api-key "YOUR_API_KEY" --workspace-id 19744
```

raw `GET` 会把 JSON 参数作为 query params 发送，raw `POST` 会把 JSON 参数作为请求 body
发送。配置了 `workspaceId` 时会默认注入到对象参数里；如果不想注入，添加 `--no-workspace`。

也可以直接从 CLI 查看包版本，并判断某个 operation 在指定 RoxyBrowser App 版本下是否可用：

```bash
npx -y @roxybrowser/openapi@beta version
npx -y @roxybrowser/openapi@beta supports browser.profile.open 4.0.4
```

电商账号模式目前只保留 preset 壳，暂不内置工具：

```bash
roxybrowser-openapi-mcp --commerce --api-key "YOUR_API_KEY" --workspace-id 19744
```

电商 preset 壳也可以直接用 `npx` 运行：

```bash
npx -y @roxybrowser/openapi@beta roxybrowser-openapi-mcp --commerce --api-key "YOUR_API_KEY" --workspace-id 19744
```

参数：

- `-H, --api-host <url>`：RoxyBrowser API 地址，默认 `http://127.0.0.1:50000`
- `-k, --api-key <key>`：RoxyBrowser API Key
- `-w, --workspace-id <id>`：默认 workspace ID，会注入到需要 workspace 的请求
- `-t, --timeout <ms>`：请求超时时间，默认 `30000`

也支持环境变量：`ROXY_API_HOST`、`ROXY_API_KEY`、`ROXY_TIMEOUT`、`ROXY_WORKSPACE_ID`。

## Codex 和 Claude Code

如果要把这个包作为正式发布的 MCP 服务添加到 Codex 或 Claude Code，直接指向 npm 包入口。

Codex：

```bash
codex mcp add roxybrowser \
  --env ROXY_API_KEY=YOUR_API_KEY \
  --env ROXY_API_HOST=http://127.0.0.1:50000 \
  --env ROXY_TIMEOUT=30000 \
  --env ROXY_WORKSPACE_ID=19744 \
  -- npx -y @roxybrowser/openapi@beta roxybrowser-openapi-mcp
```

Claude Code：

```bash
claude mcp add roxybrowser \
  -e ROXY_API_KEY=YOUR_API_KEY \
  -e ROXY_API_HOST=http://127.0.0.1:50000 \
  -e ROXY_TIMEOUT=30000 \
  -e ROXY_WORKSPACE_ID=19744 \
  -- npx -y @roxybrowser/openapi@beta roxybrowser-openapi-mcp
```

如果要接入电商模式，在命令后加 `--commerce`。

## MCP Inspector 2.0

仓库已经提供 Inspector 2.0 的双服务配置。启动前复制本地环境变量模板，并填写 RoxyBrowser 凭据：

```bash
cp .env.example .env
```

```dotenv
ROXY_API_KEY=your_api_key_from_roxybrowser
ROXY_API_HOST=http://127.0.0.1:50000
ROXY_TIMEOUT=30000
ROXY_WORKSPACE_ID=19744
```

`.env` 已被 Git 忽略。提交到仓库的 `mcp.inspector.json` 不包含凭据，会通过构建后的 `lib` 入口启动 `roxybrowser` 和 `roxycommerce` 两个 stdio 服务。

启动 Web Inspector，然后在 Servers 页面选择需要测试的服务：

```bash
pnpm inspect
```

使用终端交互界面：

```bash
pnpm inspect:tui
```

运行非交互式工具列表冒烟测试：

```bash
pnpm inspect:cli:browser
pnpm inspect:cli:commerce
```

如需直接调用工具，先构建，再从同一份配置中选择服务：

```bash
pnpm build
pnpm exec mcp-inspector --cli --config mcp.inspector.json --server roxybrowser \
  --method tools/call --tool-name roxy_workspace_list --tool-args-json '{}'
```

Inspector 2.0 要求 Node.js 22.19.0 或更高版本。本项目开发环境由仓库统一管理为 Node.js 24.15.0。

## SDK 使用

浏览器产品 SDK：

```ts
import { RoxyBrowserClient } from "@roxybrowser/openapi";

const roxy = new RoxyBrowserClient({
  apiKey: "YOUR_API_KEY",
  apiHost: "http://127.0.0.1:50000",
  workspaceId: 19744,
});

const profiles = await roxy.profiles.list({
  page: 1,
  pageSize: 20,
  windowName: "Amazon",
});
const opened = await roxy.profiles.open(profiles.rows[0].dirId, { forceOpen: true });
```

电商产品 SDK：

```ts
import { RoxyCommerceClient } from "@roxybrowser/openapi";

const commerce = new RoxyCommerceClient({
  apiKey: "YOUR_API_KEY",
  workspaceId: 19744,
});
```

`RoxyCommerceClient` 目前只是产品壳。电商 SDK 方法和 MCP 工具会在后续任务中补齐。

如果需要直接调用接近后端接口形态的能力，可以使用低层 `RoxyApiClient`：

```ts
import { RoxyApiClient } from "@roxybrowser/openapi";

const api = new RoxyApiClient({ apiKey: "YOUR_API_KEY", workspaceId: 19744 });
const raw = await api.proxy.listMerged({ page_index: 1, page_size: 20 });
```

SDK 和 MCP 能力都按 RoxyBrowser App 版本标记。`ROXY_OPENAPI_VERSION` 是当前 npm 包版本，
`supports()` 用来判断某个 operation 在指定 RoxyBrowser App 版本下是否存在：

```ts
import { RoxyBrowserClient, ROXY_OPENAPI_VERSION } from "@roxybrowser/openapi";

const roxy = new RoxyBrowserClient({
  apiKey: "YOUR_API_KEY",
  roxyBrowserVersion: "4.0.4",
});

console.log(ROXY_OPENAPI_VERSION);
console.log(roxy.getCapability("browser.profile.open"));
console.log(roxy.supports("browser.profile.open"));
```

## 嵌入式 MCP 使用

```ts
import { createRoxyBrowserMcpServer, createRoxyCommerceMcpServer } from "@roxybrowser/openapi";

const browserServer = createRoxyBrowserMcpServer({
  timeout: 45_000,
  roxyBrowserVersion: "4.0.4",
  includeTools: ["roxy_profile_list", "roxy_profile_get", "roxy_profile_open"],
  roxy: { apiKey: "YOUR_API_KEY", workspaceId: 19744 },
});

const commerceServer = createRoxyCommerceMcpServer({
  roxy: { apiKey: "YOUR_API_KEY", workspaceId: 19744 },
});
```

## 对外 MCP 工具名

浏览器模式暴露 24 个 profile 语言工具：

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
- `roxy_proxy_create`
- `roxy_proxy_update`
- `roxy_proxy_delete`
- `roxy_proxy_detect`
- `roxy_proxy_detect_channels`
- `roxy_platform_account_list`
- `roxy_platform_account_create`
- `roxy_platform_account_update`
- `roxy_platform_account_delete`

电商模式目前是空 preset 壳，在后续设计电商工具集之前不暴露内置工具。

创建 MCP preset 时应设置当前 RoxyBrowser App 版本 `roxyBrowserVersion`，这样会隐藏高于该版本的工具和 schema 字段。每个 MCP
工具都会在 `_meta` 中保留稳定的 `operationId`、底层 RoxyBrowser `endpoint` 和包版本；只有存在 App 版本门槛的工具才会额外带
`sinceRoxyBrowserVersion`。未标版本的工具和 schema 字段默认所有 RoxyBrowser App 版本可用。

创建类 MCP 工具使用同一个公开名称：单个创建直接传字段，批量创建传对应资源数组（`profiles`、`proxies` 或 `accounts`）。

## 架构

3.0 源码按职责拆分：

- `src/api`：底层 RoxyBrowser HTTP API client
- `src/sdk`：对外 SDK client
- `src/domains/browser`：浏览器 profile、proxy、workspace、platform account 领域
- `src/domains/commerce`：预留的电商领域骨架
- `src/mcp/runtime`：可复用 MCP runtime
- `src/mcp/presets/browser`：浏览器模式 MCP 预设
- `src/mcp/presets/commerce`：电商模式 MCP 预设
- `src/cli`：不同产品形态的 CLI 入口

完整设计见 [docs/architecture-3.0.md](docs/architecture-3.0.md)。

## 开发

```bash
pnpm install
pnpm check
pnpm build
pnpm test
pnpm coverage
```

Vite+ 统一管理格式化、lint、类型检查、测试、覆盖率、任务执行和库打包。`pnpm coverage` 会先构建，再运行 3.0 单元测试，并强制 API、SDK、领域层和 MCP 层的行覆盖率、分支覆盖率、函数覆盖率都达到 90%。
