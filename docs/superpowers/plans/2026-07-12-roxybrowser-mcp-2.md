# RoxyBrowser MCP 2.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the project as RoxyBrowser MCP 2.0 with an instance-based client, a context-aware tool runtime, new domain-style tool names, and unit/integration tests.

**Architecture:** The implementation introduces a client layer, runtime layer, server factory, and 2.0 tool catalog. The first landing keeps domain HTTP behavior close to the current implementation while moving MCP registration, context injection, schema shaping, and configuration into new boundaries.

**Tech Stack:** TypeScript ESM/CJS build through `tsup`, `@modelcontextprotocol/sdk`, `node:test`, native `fetch`.

## Global Constraints

- Branch: `codex/v2.0-refactor`.
- Version: `2.0.0-beta.0` while development is in progress.
- Breaking changes are allowed; 1.x compatibility is not required.
- Use `node:test`; do not add Jest or Vitest.
- Use TDD for production behavior changes.
- Keep CLI stdio startup working.

---

### Task 1: Runtime Context And Registry

**Files:**
- Create: `src/runtime/types.ts`
- Create: `src/runtime/schema.ts`
- Create: `src/runtime/context.ts`
- Create: `src/runtime/tool-registry.ts`
- Test: `test/runtime.test.mjs`

**Interfaces:**
- Produces: `defineTool(definition)`, `ToolRegistry`, `createPublicToolSchema(tool, context)`, `applyContextToArgs(tool, args, context)`.

- [ ] Write failing tests for schema hiding, context injection, and conflict rejection.
- [ ] Run `npm test -- test/runtime.test.mjs` and verify failure.
- [ ] Implement runtime files.
- [ ] Run `npm test -- test/runtime.test.mjs` and verify pass.

### Task 2: Instance-Based Roxy Client

**Files:**
- Create: `src/client/roxy-client.ts`
- Create: `src/client/config.ts`
- Create: `src/client/index.ts`
- Modify: `src/utils/index.ts`
- Test: `test/client.test.mjs`

**Interfaces:**
- Produces: `RoxyClient`, `createRoxyClientConfig`, and compatibility `request()`.

- [ ] Write failing tests for client URL/header behavior and missing API key.
- [ ] Run `npm test -- test/client.test.mjs` and verify failure.
- [ ] Implement client files and compatibility wrapper.
- [ ] Run `npm test -- test/client.test.mjs` and verify pass.

### Task 3: 2.0 Server Factory And MCP Integration

**Files:**
- Create: `src/server/roxy-mcp-server.ts`
- Modify: `src/index.ts`
- Modify: `src/cli.ts`
- Test: `test/server-v2.test.mjs`

**Interfaces:**
- Produces: `createRoxyMcpServer(options)`, `RoxyBrowserMCPServer`, `runServer(options)`.

- [ ] Write failing integration tests with `InMemoryTransport`.
- [ ] Run `npm test -- test/server-v2.test.mjs` and verify failure.
- [ ] Implement server factory and CLI wiring.
- [ ] Run `npm test -- test/server-v2.test.mjs` and verify pass.

### Task 4: 2.0 Tool Catalog

**Files:**
- Create: `src/tools/catalog.ts`
- Create: `src/tools/adapters.ts`
- Modify: `src/index.ts`
- Test: `test/tools-v2.test.mjs`

**Interfaces:**
- Produces: `ROXY_TOOLS_V2`.

- [ ] Write failing tests for new tool names and workspace injection on a representative browser/proxy/account call.
- [ ] Run `npm test -- test/tools-v2.test.mjs` and verify failure.
- [ ] Implement the 2.0 catalog using current domain handlers behind context-aware adapters.
- [ ] Run `npm test -- test/tools-v2.test.mjs` and verify pass.

### Task 5: Package Version And Documentation

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `README.md`
- Modify: `README_CN.md`

**Interfaces:**
- Consumes: `createRoxyMcpServer`, fixed context behavior, and 2.0 tool names.

- [ ] Update package version to `2.0.0-beta.0`.
- [ ] Rewrite usage documentation for CLI, embedded, InMemory, and SDK scenarios.
- [ ] Run `npm install --package-lock-only`.
- [ ] Run `npm run build`.
- [ ] Run `npm test`.
