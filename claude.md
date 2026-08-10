# AGENTS.md

This file describes the current RoxyBrowser OpenAPI 3.0 architecture for coding agents working in this repository.

## Project Overview

RoxyBrowser OpenAPI 3.0 is a breaking rewrite. The project exposes:

- a raw HTTP API client for RoxyBrowser local endpoints,
- browser-product SDK methods in profile/proxy/platform-account language,
- ecommerce-product SDK methods in account/proxy/platform-credential language,
- separate MCP presets and CLI entries for browser mode and ecommerce mode.

Keep changes inside the rewritten 3.0 layers. Do not introduce parallel compatibility layers or endpoint-shaped MCP modules.

## Development Commands

```bash
pnpm install
pnpm build
pnpm test
pnpm coverage
pnpm clean
```

`pnpm coverage` builds the package, runs the 3.0 unit tests, and enforces 90% coverage for lines, branches, and functions across `lib/api`, `lib/sdk`, `lib/domains`, and `lib/mcp`.

## Runtime Requirements

Environment variables:

```bash
ROXY_API_KEY="your_api_key_from_roxybrowser"
ROXY_API_HOST="http://127.0.0.1:50000"
ROXY_TIMEOUT="30000"
ROXY_WORKSPACE_ID="19744"
```

CLI options can override these values:

```bash
roxybrowser-openapi-mcp --api-key "YOUR_API_KEY" --workspace-id 19744
roxybrowser-openapi-mcp --commerce --api-key "YOUR_API_KEY" --workspace-id 19744
```

Inspector 2.0 uses the checked-in `mcp.inspector.json` configuration and local `.env` values:

```bash
pnpm inspect
pnpm inspect:tui
pnpm inspect:cli:browser
pnpm inspect:cli:commerce
```

## Source Layout

```txt
src/
  api/
    errors.ts
    index.ts
    roxy-api-client.ts
    transport.ts
    types.ts

  sdk/
    index.ts
    roxy-browser-client.ts
    roxy-commerce-client.ts
    shared/
      ids.ts
      normalize.ts
      pagination.ts
      result.ts

  domains/
    browser/
      index.ts
      platform-accounts.ts
      profiles.ts
      proxies.ts
      types.ts
      workspaces.ts
    commerce/
      accounts.ts
      index.ts
      platform-credentials.ts
      proxies.ts
      types.ts

  mcp/
    runtime/
      create-server.ts
      index.ts
      types.ts
    presets/
      formatting.ts
      browser/
        create-browser-mcp-server.ts
        formatters.ts
        inputs.ts
        index.ts
        tools.ts
      commerce/
        create-commerce-mcp-server.ts
        formatters.ts
        inputs.ts
        index.ts
        tools.ts

  cli/
    browser.ts
    commerce.ts

  cli.ts
  index.ts
```

## Layering Rules

Keep these names distinct:

- Backend endpoint: `POST /browser/open`
- SDK operation: `roxy.profiles.open(dirId, options)`
- Browser MCP tool: `roxy_profile_open`
- Ecommerce MCP tool: `roxy_account_open`

Only `src/api` should contain raw endpoint paths such as `/browser/open` or `/proxy/list_merged`, except for MCP tool metadata that records the endpoint for debugging.

## Low-Level API

Use `RoxyApiClient` for raw RoxyBrowser HTTP operations:

```ts
import { RoxyApiClient } from "@roxybrowser/openapi";

const api = new RoxyApiClient({
  apiKey: "YOUR_API_KEY",
  workspaceId: 19744,
});

await api.browser.open({ dirId: "profile-1" });
await api.proxy.listMerged({ page_index: 1, page_size: 20 });
```

`workspaceId` is configured once on the client and injected into workspace-scoped requests by `withDefaultWorkspace`.

## Browser SDK

Use `RoxyBrowserClient` for normal browser-product workflows:

```ts
const roxy = new RoxyBrowserClient({ apiKey, workspaceId });

await roxy.profiles.list();
await roxy.profiles.open("profile-1");
await roxy.proxies.list({ proxyType: "0" });
await roxy.platformAccounts.list();
```

## Ecommerce SDK

Use `RoxyCommerceClient` for ecommerce-product workflows. Ecommerce accounts are backed by browser profile endpoints internally.

```ts
const commerce = new RoxyCommerceClient({ apiKey, workspaceId });

await commerce.accounts.list({ windowName: "Amazon" });
await commerce.accounts.open("account-1");
```

## MCP Presets

Browser mode:

```ts
import { createRoxyBrowserMcpServer } from "@roxybrowser/openapi";
```

Commerce mode:

```ts
import { createRoxyCommerceMcpServer } from "@roxybrowser/openapi";
```

Each MCP tool definition includes:

- `name`: public MCP tool name,
- `operationId`: stable SDK/product operation ID,
- `endpoint`: underlying RoxyBrowser endpoint for debugging,
- `inputSchema`: public JSON schema,
- `handler`: domain SDK handler.

SDK/domain requests and responses keep the API documentation's field names and must not introduce
renamed models, nested view models, or `raw` wrappers. MCP is the only semantic adaptation boundary:

- preset `inputs.ts` files convert LLM-friendly inputs to API fields before calling the SDK;
- preset formatters select, combine, and explain returned fields for LLM context efficiency,
  without changing SDK/domain data;
- list formatters use Markdown tables to avoid repeating field labels and include `total`, current
  page, total pages, `pageSize`, and `nextPage` when another page exists;
- Markdown table formatters render missing cells as `-` instead of ambiguous empty cells or labels
  such as `Unnamed`, `Unknown`, and `N/A`;
- list remark and note fields show at most 20 characters and append `...` when truncated;
- single-resource detail formatters return formatted JSON with the API's original fields and
  nesting, while recursively omitting passwords and cookies. 2FA keys are returned unchanged.

## Testing Guidance

Add tests beside the rewritten layer they cover:

- `src/api/*.test.mjs`
- `src/sdk/*.test.mjs`
- `src/domains/**/*.test.mjs`
- `src/mcp/**/*.test.mjs`

Tests should import from `lib` after `pnpm build`, matching how consumers use the package.
