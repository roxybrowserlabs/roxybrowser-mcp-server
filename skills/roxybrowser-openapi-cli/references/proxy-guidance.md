# Proxy Tool Guidance

## Historical Versus Current Status

`roxy_proxy_list` shows stored detection data. A failed last check means the last recorded detection failed; it does not prove the proxy is currently unusable.

To judge current availability:

1. Call `roxy_proxy_list` to find the numeric proxy ID.
2. Call `roxy_proxy_detect` with that ID.
3. Call `roxy_proxy_list` again and locate the same ID for the refreshed record.
4. Only then describe current usability. `roxy_proxy_detect` itself returns a completion message, not the refreshed status.

After `roxy_proxy_create` or `roxy_proxy_update`, run the same detect-then-read sequence before deciding whether the proxy works. Configuration success is not an availability check.

## Creation Shape

Call `roxy_proxy_detect_channels` first and choose a returned detection channel.

`roxy_proxy_create` accepts one or more items in `proxies` plus top-level `checkChannel`. Each proxy requires `ipType`, `host`, and `port`; `protocol` defaults to `SOCKS5` when omitted. Optional credential fields are `username` and `password`.
