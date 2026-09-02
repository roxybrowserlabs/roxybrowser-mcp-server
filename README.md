# RoxyBrowser OpenAPI 3.0

[English](README.md) | [中文](README_CN.md)

RoxyBrowser OpenAPI 3.0 is a breaking rewrite of the MCP and SDK package. It separates the raw RoxyBrowser local API client from the product SDK and MCP preset, so backend endpoint names, SDK operation names, and public MCP tool names are no longer coupled.

## Install

```bash
pnpm add @roxybrowser/openapi
```

## CLI Usage

Start the browser MCP server:

```bash
roxybrowser-openapi-mcp --api-key "YOUR_API_KEY" --workspace-id 19744
```

Run the published package directly with `npx`:

```bash
npx -y @roxybrowser/openapi --api-key "YOUR_API_KEY" --workspace-id 19744
```

The package exposes a single executable, so `npx` resolves it automatically. Do not append
`roxybrowser-openapi-mcp` after the package name.

Use the CLI to inspect available MCP tools and one tool's input schema:

```bash
npx -y @roxybrowser/openapi help
npx -y @roxybrowser/openapi help tools
npx -y @roxybrowser/openapi help roxy_profile_create
npx -y @roxybrowser/openapi call roxy_profile_list '{"page":1,"pageSize":20}' --api-key "YOUR_API_KEY" --workspace-id 19744
```

Quick SDK calls are available from the same CLI. Each method argument is parsed as JSON when
possible, otherwise it is passed as a string:

```bash
npx -y @roxybrowser/openapi sdk profiles.list '{"page":1,"pageSize":20}' \
  --api-key "YOUR_API_KEY" --workspace-id 19744

npx -y @roxybrowser/openapi sdk profiles.open profile-1 '{"forceOpen":true}' \
  --api-key "YOUR_API_KEY" --workspace-id 19744
```

For a RoxyBrowser endpoint that is not in the SDK yet, call the raw API debugger:

```bash
npx -y @roxybrowser/openapi api POST /browser/new_feature '{"dirId":"profile-1"}' \
  --api-key "YOUR_API_KEY" --workspace-id 19744
```

Raw `GET` requests send JSON params as query parameters, and raw `POST` requests send JSON params
as the request body. The configured `workspaceId` is injected into object params by default; add
`--no-workspace` to disable that.

Check the package version and whether an operation exists for a RoxyBrowser app version:

```bash
npx -y @roxybrowser/openapi version
npx -y @roxybrowser/openapi supports browser.profile.open 4.0.4
```

Options:

- `-H, --api-host <url>`: RoxyBrowser API base URL. Default: `http://127.0.0.1:50000`
- `-k, --api-key <key>`: RoxyBrowser API key.
- `-w, --workspace-id <id>`: optional default workspace ID for SDK and raw API CLI calls. The browser MCP server validates the API key and discovers the active workspace at startup; ordinary MCP tools do not accept `workspaceId`.
- `-t, --timeout <ms>`: request timeout. Default: `30000`

Environment variables are also supported: `ROXY_API_HOST`, `ROXY_API_KEY`, `ROXY_TIMEOUT`, and the optional `ROXY_WORKSPACE_ID`.

## Codex and Claude Code

If you want to add this package as a published MCP server in Codex or Claude Code, point the client at the npm package entry.

Codex:

```bash
codex mcp add roxybrowser \
  --env ROXY_API_KEY=YOUR_API_KEY \
  --env ROXY_API_HOST=http://127.0.0.1:50000 \
  --env ROXY_TIMEOUT=30000 \
  --env ROXY_WORKSPACE_ID=19744 \
  -- npx -y @roxybrowser/openapi
```

Claude Code:

```bash
claude mcp add roxybrowser \
  -e ROXY_API_KEY=YOUR_API_KEY \
  -e ROXY_API_HOST=http://127.0.0.1:50000 \
  -e ROXY_TIMEOUT=30000 \
  -e ROXY_WORKSPACE_ID=19744 \
  -- npx -y @roxybrowser/openapi
```

## MCP Inspector 2.0

The repository includes an Inspector 2.0 server configuration for the browser stdio preset. Copy the local environment template and provide your RoxyBrowser credentials before starting the Inspector:

```bash
cp .env.example .env
```

```dotenv
ROXY_API_KEY=your_api_key_from_roxybrowser
ROXY_API_HOST=http://127.0.0.1:50000
ROXY_TIMEOUT=30000
ROXY_WORKSPACE_ID=19744
```

`.env` is ignored by Git. The checked-in `mcp.inspector.json` contains no credentials and starts `roxybrowser` from the built `lib` entry.

Start the Web Inspector and select the server from the Servers screen:

```bash
pnpm inspect
```

Use the terminal UI instead:

```bash
pnpm inspect:tui
```

Run non-interactive tool-list smoke tests:

```bash
pnpm inspect:cli:browser
```

For a direct CLI call, build first and select a server from the shared configuration:

```bash
pnpm build
pnpm exec mcp-inspector --cli --config mcp.inspector.json --server roxybrowser \
  --method tools/call --tool-name roxy_workspace_list --tool-args-json '{}'
```

Inspector 2.0 requires Node.js 22.19.0 or newer. The development runtime managed by this repository is Node.js 24.15.0.

## SDK Usage

Browser product SDK:

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

Low-level API access is available through `RoxyApiClient` when endpoint-shaped calls are needed:

```ts
import { RoxyApiClient } from "@roxybrowser/openapi";

const api = new RoxyApiClient({ apiKey: "YOUR_API_KEY", workspaceId: 19744 });
const raw = await api.proxy.listMerged({ page_index: 1, page_size: 20 });
```

SDK and MCP capabilities are versioned against the RoxyBrowser app version. The package version is
available as `ROXY_OPENAPI_VERSION`, while `supports()` checks a RoxyBrowser app version:

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

## Embedded MCP Usage

```ts
import { createRoxyBrowserMcpServer } from "@roxybrowser/openapi";

const browserServer = createRoxyBrowserMcpServer({
  timeout: 45_000,
  roxyBrowserVersion: "4.0.4",
  includeTools: ["roxy_profile_list", "roxy_profile_get", "roxy_profile_open"],
  roxy: { apiKey: "YOUR_API_KEY", workspaceId: 19744 },
});
```

## Public MCP Tool Names

The browser preset exposes 27 tools in profile language. On startup it calls
`roxy_workspace_get_active` with the configured API key, caches the returned workspace ID, and uses
that ID for workspace-scoped requests. Ordinary MCP tools do not expose a `workspaceId` argument.
`roxy_workspace_select` is the exception because it requires the target workspace ID; after a
successful switch it replaces the cached API key, API host, and workspace ID for subsequent calls.
Its result includes the new API key, host, port, OpenAPI status, and API rate limit, and instructs
the caller to use the new credentials because requests with the previous connection will fail.

- `roxy_workspace_list` (RoxyBrowser 4.0.4+; lists all workspaces through `/workspace/list`)
- `roxy_workspace_list_all` (legacy alias; RoxyBrowser 4.0.4+)
- `roxy_workspace_select` (RoxyBrowser 4.0.4+)
- `roxy_workspace_get_active` (RoxyBrowser 4.0.4+)
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

Set `roxyBrowserVersion` to the current RoxyBrowser app version when creating a preset. Tools and
schema fields added after that app version are hidden.
Each MCP tool keeps debug metadata with a stable `operationId`, the underlying RoxyBrowser endpoint,
the package version, and `sinceRoxyBrowserVersion` in tool `_meta` only when that tool has an app
version requirement. Unmarked tools and schema fields are available for all RoxyBrowser app versions.

Create tools accept a resource array. Pass one item to create a single resource, or multiple items to
create a batch. Browser profile, proxy, and platform-account tools use `profiles`, `proxies`, and
`accounts`.

## Architecture

The 3.0 source tree is intentionally split:

- `src/api`: raw RoxyBrowser HTTP API client.
- `src/sdk`: public SDK clients.
- `src/domains/browser`: browser profile, proxy, workspace, and platform account domains.
- `src/mcp/runtime`: reusable MCP runtime.
- `src/mcp/presets/browser`: browser-mode MCP preset.
- `src/cli`: CLI implementation.

See [docs/architecture-3.0.md](docs/architecture-3.0.md) for the full design.

## Development

```bash
pnpm install
pnpm check
pnpm build
pnpm test
pnpm coverage
```

Vite+ manages formatting, linting, type checks, testing, coverage, task execution, and library packaging. `pnpm coverage` builds the package, runs the 3.0 unit tests, and enforces 90% coverage for lines, branches, and functions across the rewritten API, SDK, domain, and MCP layers.
