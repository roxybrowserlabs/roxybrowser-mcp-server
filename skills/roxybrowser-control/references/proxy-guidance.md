# Proxy Guidance

## Critical Semantics

`roxy_proxy_list` and `roxy_proxy_detail` show historical detection data. A failed last check means the last recorded detection failed. It does not prove the proxy is currently unusable.

## Correct Availability Workflow

1. Use `roxy_proxy_list` to find candidate proxy IDs.
2. Use `roxy_proxy_detail` to inspect one proxy configuration when needed.
3. If availability matters, call `roxy_proxy_detect`.
4. Only describe current usability after `roxy_proxy_detect` returns a fresh result.

## What To Say

If list/detail shows failed or unknown status, say:

```text
The last recorded check failed or is unknown. I need to run roxy_proxy_detect before judging current availability.
```

Do not say:

```text
This proxy IP is unavailable.
```

unless the statement is based on a fresh `roxy_proxy_detect` result.

## After Create Or Modify

Use one `roxy_proxy_create` call with all requested proxies in `proxyList`; the array form also handles a single proxy.

After `roxy_proxy_create` or `roxy_proxy_modify`, call `roxy_proxy_detect` before deciding whether the proxy works. Configuration success is not an availability check.
