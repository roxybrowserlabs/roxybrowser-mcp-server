# CLI Tool Workflows

Tool names below are passed after `npx -y @roxybrowser/openapi call`. Use `help <tool-name>` to inspect the current input schema before calling an unfamiliar tool.

## Find Workspace And Project Context

1. Call `roxy_workspace_list` when the workspace ID is unknown.
2. Select a workspace from the live result and pass its ID as `--workspace-id`.
3. Call `roxy_project_list` when a project ID is needed.

## Inspect Existing Browsers

1. Call `roxy_profile_list` with filters when useful.
2. Call `roxy_profile_get` with a returned `dirId` when full details are needed.

## Create Browser With Proxy

1. Call `roxy_proxy_list` to find candidates.
2. Call `roxy_proxy_detect` with the selected numeric proxy ID.
3. Call `roxy_proxy_list` again to inspect the refreshed status.
4. Call `roxy_profile_create` with one or more items in `profiles`; bind the proxy through `proxyInfo.id`.
5. Call `roxy_profile_open` with the returned `dirId`.
6. Use the returned CDP/BiDi endpoint for browser automation.

## Diagnose Proxy Problem

1. Call `roxy_proxy_list` to find the proxy ID.
2. Call `roxy_proxy_detect` with that ID.
3. Call `roxy_proxy_list` again to read the updated detection fields.
4. Explain the fresh result separately from the historical status seen before detection.

## Recover Browser Automation Endpoint

1. Call `roxy_profile_connection_info` with the relevant `dirIds`.
2. If no endpoint is returned, call `roxy_profile_open`.

## Cleanup

- Call `roxy_profile_close` to stop running browsers.
- Do not call delete tools unless the user explicitly requests deletion.
