# Browser Guidance

## Browser Automation Flow

1. Discover workspace/project context if the user did not provide it.
2. Use `browser.list` to find existing profiles.
3. Use `browser.create` or `browser.batch_create` only when a suitable profile does not exist or the user asks to create one.
4. Use `browser.open` to start profiles.
5. Use the returned CDP WebSocket endpoint for browser automation.
6. Use `browser.close` when the user asks to stop running browsers.

## CDP Endpoint Rule

The CDP WebSocket endpoint returned by `browser.open` is the handoff point to Playwright-style automation. Do not claim the browser is ready for automation until that endpoint is available.

## Existing Open Browsers

Use `browser.connection_info` to recover CDP endpoints for already opened profiles.

## Safe Cleanup

Use `browser.close` for stopping a running browser. Use `browser.delete` only when the user explicitly asks to permanently delete browser profiles.
