# Public Browser Tool Reference

Run `npx -y @roxybrowser/openapi help tools` for the current catalog and `help <tool-name>` for the exact input schema. Execute a tool with `call <tool-name> '<args-json>'`.

## Workspace, Project, And Labels

- `roxy_workspace_list`: list workspaces; accepts optional `page` and `pageSize`.
- `roxy_project_list`: list projects in the configured workspace; accepts optional `page` and `pageSize`.
- `roxy_label_list`: list browser labels; pass `{}`.

## Browser Profiles

- `roxy_profile_list`: list profiles using optional filters from its help schema.
- `roxy_profile_get`: requires `dirId`.
- `roxy_profile_create`: requires `profiles`, an array containing one or more profile objects.
- `roxy_profile_update`: requires `dirId`; include only requested patch fields.
- `roxy_profile_open`: requires `dirId`; options include `force`, `args`, and `headless`.
- `roxy_profile_close`: requires `dirId`.
- `roxy_profile_delete`: requires `dirIds`; `soft` defaults to soft deletion.
- `roxy_profile_connection_info`: accepts optional `dirIds`.
- `roxy_profile_randomize_fingerprint`: requires `dirId`.
- `roxy_profile_clear_local_cache`: requires `dirIds`; `type` is `partial`, `all`, or `cloud`.
- `roxy_profile_clear_server_cache`: requires `dirIds`.

Create/update profile objects use LLM-friendly fields such as `name`, `remark`, `urls`, `platformAccounts`, `proxyInfo`, and `fingerInfo`.

## Proxies

- `roxy_proxy_list`: list proxies using optional filters from its help schema.
- `roxy_proxy_create`: requires top-level `checkChannel` and a `proxies` array. Each item requires `ipType`, `host`, and `port`; `protocol` defaults to `SOCKS5`.
- `roxy_proxy_update`: requires `id`, `checkChannel`, `ipType`, `protocol`, `host`, and `port`.
- `roxy_proxy_delete`: requires numeric `ids`.
- `roxy_proxy_detect`: requires numeric `id`.
- `roxy_proxy_detect_channels`: pass `{}`.

Proxy tool inputs use LLM-friendly credential fields `username` and `password`.

## Platform Accounts

- `roxy_platform_account_list`: list accounts; accepts optional `page` and `pageSize`.
- `roxy_platform_account_create`: requires `accounts`, an array whose items require `platformUrl`.
- `roxy_platform_account_update`: requires `id` and `platformUrl`.
- `roxy_platform_account_delete`: requires numeric `ids`.

Platform-account tool inputs use `username`, `password`, `twoFactorKey`, and `remarks`.
