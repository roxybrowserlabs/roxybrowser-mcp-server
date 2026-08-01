# API Source

`roxy-api.json` is the canonical source for API documentation, code examples, reusable appendix
catalogs, generated TypeScript types, and generated `RoxyBrowserClient` operations. Its structure is described by
`roxy-api.schema.json`.

Run the generator after editing the JSON source:

```bash
pnpm generate:api
```

Check that committed artifacts are current without changing files:

```bash
pnpm generate:api:check
```

Run the opt-in live test against a local RoxyBrowser service. The runner creates isolated test
profiles, proxies, and platform accounts, then removes them in `finally` cleanup:

```bash
ROXY_API_KEY="..." ROXY_API_HOST="http://127.0.0.1:50003" pnpm test:e2e
```

`ROXY_WORKSPACE_ID` and `ROXY_E2E_PROJECT_ID` can select a specific workspace and project. The
runner audits all canonical endpoints and request fields against the actual HTTP traffic.

The completed migration has `migration.complete` set to `true`, so the generator writes the
official English and Chinese Markdown files in `docs/`. If a future migration temporarily sets it
to `false`, Markdown is written to `docs/generated/` to avoid replacing the complete references.

Reusable appendix values belong in `catalogs`. A field schema can reference one with
`catalogRef`, allowing the same values to generate both appendix content and TypeScript unions.
