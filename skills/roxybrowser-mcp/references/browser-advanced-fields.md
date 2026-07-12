# Browser Advanced Fields

Use these fields only when the user explicitly asks to bind platform accounts or proxy settings during `browser.create` or `browser.update`. For ordinary browser creation and editing, omit `windowPlatformList` and `proxyInfo`.

The MCP tool schema intentionally keeps these fields compact. Read this reference only when a request needs these advanced objects.

## windowPlatformList

`windowPlatformList` is an array of platform account binding objects.

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `id` | number | - | Platform account ID from `account.list`. When provided, use it to bind an existing account and omit the other account credential fields. |
| `platformUrl` | string | - | Platform URL. |
| `platformUserName` | string | - | Platform username. |
| `platformPassword` | string | - | Platform password. |
| `platformEfa` | string | - | Platform EFA / 2FA secret. |
| `platformRemarks` | string | - | Platform account remarks. |

## proxyInfo

Prefer binding an existing proxy by `moduleId` from `proxy.list` when possible. If `moduleId` is provided, do not pass custom proxy host, port, username, password, protocol, or refresh fields.

| Field | Type | Values | Description |
| --- | --- | --- | --- |
| `moduleId` | number | - | Existing proxy module ID from `proxy.list` field `id`. |
| `proxyMethod` | string | `custom`, `choose`, `api` | Proxy selection method. |
| `proxyCategory` | string | `noproxy`, `HTTP`, `HTTPS`, `SOCKS5`, `SSH` | Proxy category. |
| `ipType` | string | `IPV4`, `IPV6` | Proxy IP type. |
| `protocol` | string | `HTTP`, `HTTPS`, `SOCKS5` | Custom proxy protocol. |
| `host` | string | - | Custom proxy host. |
| `port` | string | - | Custom proxy port. |
| `proxyUserName` | string | - | Custom proxy username. |
| `proxyPassword` | string | - | Custom proxy password. |
| `refreshUrl` | string | - | Dynamic proxy refresh URL. |
| `checkChannel` | string | `IPRust.io`, `IP-API`, `IP123.in` | Proxy detection channel. |
