# Tool Reference

## Workspace And Project

- `roxy_workspace_list`: list workspaces and their project summaries when no workspace is fixed.
- `roxy_project_list`: list projects in the fixed workspace when the server is bound to `workspaceId`.
- `roxy_health_check`: verify RoxyBrowser API reachability.

## Browser

- `roxy_browser_list`
- `roxy_browser_create`: create one or more browsers using the `browsers` array. Use this array form even for a single browser.
- `roxy_browser_open`
- `roxy_browser_close`
- `roxy_browser_update`
- `roxy_browser_delete`
- `roxy_browser_detail`
- `roxy_browser_connection_info`
- `roxy_browser_clear_local_cache`
- `roxy_browser_clear_server_cache`
- `roxy_browser_list_labels`

## Proxy

- `roxy_proxy_list`
- `roxy_proxy_detail`
- `roxy_proxy_create`: create one or more proxies using the `proxyList` array. Use this array form even for a single proxy.
- `roxy_proxy_detect`
- `roxy_proxy_modify`
- `roxy_proxy_delete`

## Account

- `roxy_account_list`
- `roxy_account_create`: create one or more accounts using the `accountList` array. Use this array form even for a single account.
- `roxy_account_modify`
- `roxy_account_delete`
