# Browser Guidance

## Browser Automation Flow

1. Discover workspace/project context if the user did not provide it.
2. Use `roxy_browser_list` to find existing profiles.
3. Use `roxy_browser_create` only when a suitable profile does not exist or the user asks to create one. Pass every requested profile in the `browsers` array, even when creating a single browser.
4. Use `roxy_browser_open` to start profiles.
5. Use the returned CDP WebSocket endpoint for browser automation.
6. Use `roxy_browser_close` when the user asks to stop running browsers.

## CDP/Bidi Endpoint Rule

The CDP/Bidi WebSocket endpoint returned by `roxy_browser_open` is the handoff point to Playwright-style automation. Do not claim the browser is ready for automation until that endpoint is available.

## Existing Open Browsers

Use `roxy_browser_connection_info` to recover CDP/Bidi endpoints for already opened profiles.

## Fingerprint Options

Do not include `fingerInfo` during ordinary `roxy_browser_create` or `roxy_browser_update` calls. Most users do not need fingerprint customization.

Only use `fingerInfo` when the user explicitly asks for fingerprint behavior such as language, timezone, geolocation, media loading, WebRTC, Canvas, WebGL, hardware, resolution, sync, cache, or startup/security settings. When needed, read [fingerprint-fields.md](fingerprint-fields.md) for supported fields and pass only the fields relevant to the user's request.

## Platform And Proxy Binding

Do not include `windowPlatformList` or `proxyInfo` during ordinary `roxy_browser_create` or `roxy_browser_update` calls.

Use `windowPlatformList` only when the user explicitly asks to bind platform accounts during browser creation or editing. Use `proxyInfo` only when the user explicitly asks to bind or configure a browser proxy. When needed, read [browser-advanced-fields.md](browser-advanced-fields.md) and pass only the relevant fields.

## Safe Cleanup

Use `roxy_browser_close` for stopping a running browser. Use `roxy_browser_delete` only when the user explicitly asks to permanently delete browser profiles.
