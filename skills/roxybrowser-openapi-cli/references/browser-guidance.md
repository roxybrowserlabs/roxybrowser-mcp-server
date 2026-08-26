# Browser Tool Guidance

## Browser Automation Flow

1. Discover workspace/project context if the user did not provide it.
2. Use `roxy_profile_list` to find existing profiles.
3. Use `roxy_profile_create` only when a suitable profile does not exist or the user asks to create one. Put every requested profile in the `profiles` array, including a single profile.
4. Use `roxy_profile_open` with a returned `dirId`.
5. Use the returned CDP/BiDi WebSocket endpoint for browser automation.
6. Use `roxy_profile_close` when the user asks to stop a running browser.

## CDP/BiDi Endpoint Rule

The endpoint returned by `roxy_profile_open` is the handoff point to Playwright-style automation. Do not claim the browser is ready for automation until that endpoint is available.

Use `roxy_profile_connection_info` to recover endpoints for already opened profiles.

## Optional Profile Fields

Do not include `fingerInfo`, `platformAccounts`, or `proxyInfo` in ordinary `roxy_profile_create` or `roxy_profile_update` calls.

- Use `fingerInfo` only when the user explicitly requests fingerprint behavior such as language, timezone, geolocation, media loading, WebRTC, Canvas, WebGL, hardware, resolution, sync, cache, or startup/security settings. Read [fingerprint-fields.md](fingerprint-fields.md) when needed.
- Use `platformAccounts` only when the user explicitly asks to bind platform accounts.
- Use `proxyInfo` only when the user explicitly asks to bind or configure a browser proxy. Read [browser-advanced-fields.md](browser-advanced-fields.md) for both binding objects.

Pass only requested fields and rely on tool/API defaults for other optional behavior.

## Safe Cleanup

Use `roxy_profile_close` to stop a running browser. `roxy_profile_delete` defaults to moving profiles to the recycle bin. Pass `"soft": false` only when the user explicitly requests permanent deletion.

