---
name: roxybrowser-openapi-cli
description: Use when an agent must run the published @roxybrowser/openapi CLI from a shell to discover and call RoxyBrowser browser tools. 
---

# RoxyBrowser OpenAPI CLI

## Core Rule

Run the stable published package as:

```bash
npx -y @roxybrowser/openapi <subcommand>
```

Do not append `roxybrowser-openapi-mcp` or a prerelease tag. Running the CLI without a subcommand starts the long-running MCP stdio server; direct Agent work should use a finite subcommand.

## Use `call` For Agent Work

`call` is the main interface for this Skill:

```bash
npx -y @roxybrowser/openapi call <tool-name> '<args-json>' \
  --api-key "YOUR_API_KEY" --workspace-id 19744
```

RoxyBrowser's original OpenAPI was created before MCP and Agents, so its raw API fields are not designed for LLM input. The `call` layer exists to solve that problem. It exposes public `roxy_*` tool names, accepts LLM-friendly arguments, converts them to the underlying request shape, omits or defaults difficult fields where appropriate, and formats the result for model context.

Prefer `call` for normal operations. Do not copy an original API field name into a `call` request, and do not copy a `call` input object into an SDK request.

## Discover And Call

1. Run `help tools` to discover the current public browser tool catalog.
2. Run `help <tool-name>` for the exact input schema of an unfamiliar tool.
3. Pass one JSON object to `call`; use `{}` when the tool has no inputs.
4. Read the formatted text result and use IDs/endpoints returned by that result for the next call.

```bash
npx -y @roxybrowser/openapi help tools
npx -y @roxybrowser/openapi help roxy_profile_create
npx -y @roxybrowser/openapi call roxy_workspace_list '{}' \
  --api-key "YOUR_API_KEY"
npx -y @roxybrowser/openapi call roxy_profile_list '{"page":1,"pageSize":20}' \
  --api-key "YOUR_API_KEY" --workspace-id 19744
npx -y @roxybrowser/openapi call roxy_profile_open '{"dirId":"profile-1"}' \
  --api-key "YOUR_API_KEY" --workspace-id 19744
```

The `help` schema is the source for public tool arguments. The CLI prints a tool's formatted text result, not the raw transport response. Do not claim a browser is ready for automation until `roxy_profile_open` or `roxy_profile_connection_info` returns a CDP/BiDi endpoint.

## Connection

The published package requires Node.js `^24.11.0`. Check `node --version` when `npx` reports an engine error.

Connection options may follow `call` or `sdk`:

```text
--api-key <key>
--api-host <url>
--workspace-id <id>
--timeout <ms>
```

Equivalent environment variables are `ROXY_API_KEY`, `ROXY_API_HOST`, `ROXY_WORKSPACE_ID`, and `ROXY_TIMEOUT`. Prefer environment variables when credentials are already available; never echo real keys. The default API host is `http://127.0.0.1:50000`.

If the workspace is unknown, call `roxy_workspace_list` first. If connection fails, verify the actual RoxyBrowser API host and that the local app is running.

## SDK, Briefly

`sdk` is a lower-level direct SDK/API operation, not the Agent-friendly wrapper. Its parameters and return values are not adapted by `call`; use the original endpoint definitions in the [RoxyBrowser API documentation](https://roxybrowser.cn/docs/api-documentation/api-endpoint.html). Use `sdk` only when a public `call` tool does not fit.

## Operating Rules

- Discover live workspace, project, profile, proxy, and account IDs through public list/get tools; do not invent IDs.
- Use API/tool defaults for optional creation fields unless the user requested specific values.
- After `roxy_proxy_detect`, call `roxy_proxy_list` again before judging current availability; detection itself returns only a completion message.
- Do not call delete tools unless the user explicitly requests deletion. Profile deletion is soft by default; use the tool's `soft: false` only for an explicit permanent-delete request.
- Keep `fingerInfo`, `platformAccounts`, and `proxyInfo` out of ordinary profile calls; include them only when requested. Read the linked references for their public `call` shapes.

## References

- Public tool names and input shapes: [tool-reference.md](references/tool-reference.md)
- Common call workflows: [workflows.md](references/workflows.md)
- Browser profile behavior: [browser-guidance.md](references/browser-guidance.md)
- Platform-account and proxy binding fields: [browser-advanced-fields.md](references/browser-advanced-fields.md)
- Fingerprint fields and appendix values: [fingerprint-fields.md](references/fingerprint-fields.md)
- Proxy status semantics: [proxy-guidance.md](references/proxy-guidance.md)
- RoxyBrowser AI Agent FAQ: [AI Agent FAQ](https://roxybrowser.cn/docs/faqs/ai-agent.html)
