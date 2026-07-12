# Tool Reference

## Workspace And Project

- `workspace.list`: list workspaces and their project summaries when no workspace is fixed.
- `project.list`: list projects in the fixed workspace when the server is bound to `workspaceId`.
- `health.check`: verify RoxyBrowser API reachability.

## Browser

- `browser.list`
- `browser.create`: create one or more browsers using the `browsers` array. Use this array form even for a single browser.
- `browser.open`
- `browser.close`
- `browser.update`
- `browser.delete`
- `browser.detail`
- `browser.connection_info`
- `browser.clear_local_cache`
- `browser.clear_server_cache`
- `browser.list_labels`

## Proxy

- `proxy.list`
- `proxy.detail`
- `proxy.create`: create one or more proxies using the `proxyList` array. Use this array form even for a single proxy.
- `proxy.detect`
- `proxy.modify`
- `proxy.delete`

## Account

- `account.list`
- `account.create`: create one or more accounts using the `accountList` array. Use this array form even for a single account.
- `account.modify`
- `account.delete`
