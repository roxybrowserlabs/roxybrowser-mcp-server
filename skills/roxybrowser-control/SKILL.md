---
name: roxybrowser-control
description: Use when controlling RoxyBrowser through MCP tools, managing browser profiles, proxies, accounts, workspaces, projects, CDP/Bidi endpoints, or diagnosing RoxyBrowser automation setup.
---

# RoxyBrowser Control

## Core Rule

Use RoxyBrowser MCP as the source of truth for workspace, project, browser, proxy, account, and CDP/Bidi endpoint IDs. Do not invent IDs or infer live proxy/browser state from stale list output.

## First Steps

- If `roxy_workspace_list` is available and the workspace is unclear, call it before choosing IDs.
- If `roxy_project_list` is available, the MCP server is bound to a workspace; use it for project discovery.
- For browser automation, list or create a browser profile, then call `roxy_browser_open` to get the CDP/Bidi endpoint.
- For proxy availability, call `roxy_proxy_detect`; `roxy_proxy_list` and `roxy_proxy_detail` show historical check data.

## Context Rules

- Fixed workspace mode hides `roxy_workspace_list` and exposes `roxy_project_list`.
- In fixed workspace mode, workspace-scoped tools may not expose `workspaceId`; do not ask the user for it.
- If `roxy_workspace_list` is visible, use it to discover `workspaceId` before workspace-scoped actions.
- Never call delete tools unless the user explicitly asks.

## Common Workflows

Read [workflows.md](references/workflows.md) for browser setup, proxy diagnosis, CDP handoff, and cleanup flows.

## Domain Guidance

- Browser profile and CDP/Bidi rules: [browser-guidance.md](references/browser-guidance.md)
- browser platform-account/proxy fields: [browser-advanced-fields.md](references/browser-advanced-fields.md)
- Advanced browser fingerprint fields: [fingerprint-fields.md](references/fingerprint-fields.md)
- Fingerprint resolution values: [fingerprint-resolutions.md](references/fingerprint-resolutions.md)
- Fingerprint browser language values: [fingerprint-languages.md](references/fingerprint-languages.md)
- Fingerprint interface language values: [fingerprint-interface-languages.md](references/fingerprint-interface-languages.md)
- Fingerprint timezone values: [fingerprint-timezones.md](references/fingerprint-timezones.md)
- Proxy availability and historical status rules: [proxy-guidance.md](references/proxy-guidance.md)
- Current 2.0 tool names: [tool-reference.md](references/tool-reference.md)

## Critical Mistakes To Avoid

- Do not say a proxy is currently unusable based only on `roxy_proxy_list` or `roxy_proxy_detail`.
- Do not use `roxy_workspace_list` as a project-list substitute; use `roxy_project_list` when the workspace is fixed.
- Do not assume a browser is controllable until `roxy_browser_open` returns a CDP/Bidi WebSocket endpoint.
- Do not delete browsers, proxies, or accounts as cleanup unless requested.
