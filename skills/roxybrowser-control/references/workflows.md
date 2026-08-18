# Workflows

## Find Workspace Or Project Context

- If `roxy_workspace_list` is visible, call it to discover workspace and project IDs.
- If `roxy_project_list` is visible, the server is already bound to a workspace; call `roxy_project_list` for paginated project discovery.

## Inspect Existing Browsers

1. `roxy_profile_list`
2. `roxy_profile_get` for a specific profile when more information is needed.

## Create Browser With Proxy

1. `roxy_proxy_list`
2. `roxy_proxy_detect` for candidate proxies before judging usability.
3. `roxy_profile_create`
4. `roxy_profile_open`
5. Use the returned CDP endpoint for automation.

## Diagnose Proxy Problem

1. `roxy_proxy_list`
2. `roxy_proxy_detect`
3. Explain the fresh detection result separately from historical list status.

## Recover Browser Automation Endpoint

1. `roxy_profile_connection_info`
2. If no endpoint is found, call `roxy_profile_open`.

## Cleanup

- Use `roxy_profile_close` for running browsers.
- Use delete tools only when explicitly requested.
