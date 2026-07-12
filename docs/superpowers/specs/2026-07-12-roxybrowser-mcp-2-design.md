# RoxyBrowser MCP 2.0 Design

## Goal

RoxyBrowser MCP 2.0 is a breaking redesign of the package as a composable MCP server and SDK. Version 1.x remains the compatibility and maintenance line; 2.0 optimizes for embedded usage, fixed workspace/project contexts, testability, and future transports.

## Non-Goals

- Preserve 1.x tool names or direct `tool.handle(args)` APIs.
- Keep process-wide environment variables as the only configuration source.
- Add compatibility shims that obscure the new runtime boundaries.

## Architecture

The 2.0 server is composed from four layers:

- `client`: an instance-based RoxyBrowser API client.
- `runtime`: tool definitions, tool registry, schema transforms, and context injection.
- `server`: MCP server assembly and transport entry points.
- `tools`: MCP-facing tool definitions grouped by domain.

Tools declare their required scope instead of manually managing context fields:

- `global`: no workspace/project context.
- `workspace`: requires `workspaceId`.
- `project`: requires `projectId` and may also use `workspaceId`.

When a server is created with a fixed context, the runtime hides those bound parameters from public tool schemas and injects them into tool calls. If a caller passes a bound parameter with a conflicting value, the runtime rejects the call.

## Public API Shape

```ts
const server = createRoxyMcpServer({
  roxy: {
    apiKey: '...',
    apiHost: 'http://127.0.0.1:50000',
    timeout: 30000,
  },
  context: {
    workspaceId: 123,
    projectId: 456,
  },
})

await server.connect(serverTransport)
```

The CLI creates the same server with stdio transport. Embedded callers can use SDK `InMemoryTransport` directly with `server.connect()`.

## Tool Naming

2.0 uses domain-style tool names:

- `workspace.list`
- `health.check`
- `browser.list`
- `browser.create`
- `browser.batch_create`
- `browser.open`
- `browser.close`
- `browser.update`
- `browser.delete`
- `browser.detail`
- `browser.connection_info`
- `browser.clear_local_cache`
- `browser.clear_server_cache`
- `browser.random_fingerprint`
- `browser.list_labels`
- `proxy.list`
- `proxy.detail`
- `proxy.create`
- `proxy.detect`
- `proxy.modify`
- `proxy.delete`
- `account.list`
- `account.create`
- `account.batch_create`
- `account.modify`
- `account.delete`

## Testing Strategy

2.0 uses `node:test` and mock fetch/client fixtures.

- Runtime unit tests cover registry dispatch, schema visibility, context injection, and conflict errors.
- Client unit tests cover request URL construction, headers, timeout config, and HTTP errors.
- MCP integration tests use SDK `InMemoryTransport` and verify `listTools` / `callTool` behavior.
- Tool tests cover the most important request mapping and response formatting.

## Acceptance Criteria

- `npm run build` succeeds.
- `npm test` succeeds.
- `package.json` version is `2.0.0-beta.0` during implementation.
- 2.0 tool names are exposed through MCP.
- Fixed workspace context removes `workspaceId` from public schemas and injects it during tool calls.
- CLI still starts a stdio MCP server, but uses the new server factory.
