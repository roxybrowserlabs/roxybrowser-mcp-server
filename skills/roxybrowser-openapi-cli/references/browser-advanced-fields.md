# Browser Advanced Tool Fields

Use these LLM-friendly fields only when the user explicitly asks to bind platform accounts or proxy settings in a profile create/update call. For ordinary profile creation and editing, omit `platformAccounts` and `proxyInfo`.

For `roxy_profile_create`, place these fields inside each item in `profiles`. For `roxy_profile_update`, place them beside `dirId`.

## platformAccounts

`platformAccounts` is an array of binding objects.

| Field | Type | Description |
| --- | --- | --- |
| `id` | number | Existing account ID returned by `roxy_platform_account_list`. When provided, omit credential fields. |
| `platformUrl` | string | Platform URL for an inline account. |
| `username` | string | Platform username. |
| `password` | string | Platform password. |
| `twoFactorKey` | string | Platform EFA/2FA secret. |
| `remarks` | string | Platform account remarks. |

## proxyInfo

Prefer binding an existing proxy returned by `roxy_proxy_list` as `{"id":123}`. When `id` is present, omit custom connection fields.

For a custom proxy, use the relevant fields below.

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `id` | number | - | Existing proxy ID. |
| `proxyMethod` | string | `custom`, `choose`, `api` | Proxy selection method. |
| `proxyCategory` | string | `noproxy`, `HTTP`, `HTTPS`, `SOCKS5`, `SSH` | Proxy category. |
| `ipType` | string | `IPV4`, `IPV6` | Proxy IP type. |
| `host` | string | - | Custom proxy host. |
| `port` | string | - | Custom proxy port. |
| `username` | string | - | Custom proxy username. |
| `password` | string | - | Custom proxy password. |
| `refreshUrl` | string | - | Dynamic proxy refresh URL. |
| `checkChannel` | string | `IPRust.io`, `IP-API`, `IP123.in` | Proxy detection channel. |

