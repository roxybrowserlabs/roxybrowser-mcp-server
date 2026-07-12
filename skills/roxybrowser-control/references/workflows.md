# Workflows

## Find Workspace Or Project Context

- If `workspace.list` is visible, call it to discover workspace and project IDs.
- If `project.list` is visible, the server is already bound to a workspace; call `project.list` for paginated project discovery.

## Inspect Existing Browsers

1. `browser.list`
2. `browser.detail` for a specific profile when more information is needed.

## Create Browser With Proxy

1. `proxy.list`
2. `proxy.detect` for candidate proxies before judging usability.
3. `browser.create`
4. `browser.open`
5. Use the returned CDP endpoint for automation.

## Diagnose Proxy Problem

1. `proxy.detail`
2. `proxy.detect`
3. Explain the fresh detection result separately from historical list/detail status.

## Recover Browser Automation Endpoint

1. `browser.connection_info`
2. If no endpoint is found, call `browser.open`.

## Cleanup

- Use `browser.close` for running browsers.
- Use delete tools only when explicitly requested.
