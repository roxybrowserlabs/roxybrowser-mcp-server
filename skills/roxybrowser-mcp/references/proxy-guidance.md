# Proxy Guidance

## Critical Semantics

`proxy.list` and `proxy.detail` show historical detection data. A failed last check means the last recorded detection failed. It does not prove the proxy is currently unusable.

## Correct Availability Workflow

1. Use `proxy.list` to find candidate proxy IDs.
2. Use `proxy.detail` to inspect one proxy configuration when needed.
3. If availability matters, call `proxy.detect`.
4. Only describe current usability after `proxy.detect` returns a fresh result.

## What To Say

If list/detail shows failed or unknown status, say:

```text
The last recorded check failed or is unknown. I need to run proxy.detect before judging current availability.
```

Do not say:

```text
This proxy IP is unavailable.
```

unless the statement is based on a fresh `proxy.detect` result.

## After Create Or Modify

After `proxy.create` or `proxy.modify`, call `proxy.detect` before deciding whether the proxy works. Configuration success is not an availability check.
