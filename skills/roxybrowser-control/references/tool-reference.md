# Tool Reference

## Workspace, Project, And Labels

- `roxy_workspace_list`: list workspaces and their project summaries when no workspace is fixed.
- `roxy_project_list`: list projects in the fixed workspace when the server is bound to `workspaceId`.
- `roxy_label_list`: list browser profile labels.

## Browser Profile

- `roxy_profile_list`
- `roxy_profile_get`
- `roxy_profile_create`: create one or more browser profiles using the `profiles` array. Use this array form even for a single profile.
- `roxy_profile_update`
- `roxy_profile_open`
- `roxy_profile_close`
- `roxy_profile_delete`
- `roxy_profile_connection_info`
- `roxy_profile_randomize_fingerprint`
- `roxy_profile_clear_local_cache`
- `roxy_profile_clear_server_cache`

## Proxy

- `roxy_proxy_list`
- `roxy_proxy_create`: create one proxy with direct fields, or create many using the `proxies` array.
- `roxy_proxy_update`
- `roxy_proxy_delete`
- `roxy_proxy_detect`
- `roxy_proxy_detect_channels`

## Platform Account

- `roxy_platform_account_list`
- `roxy_platform_account_create`: create one or more platform accounts using the `platformAccounts` array. Use this array form even for a single account.
- `roxy_platform_account_update`
- `roxy_platform_account_delete`
