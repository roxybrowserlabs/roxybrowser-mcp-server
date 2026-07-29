import assert from "node:assert/strict";

export function installFetchMock(impl) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = impl;
  return () => {
    globalThis.fetch = originalFetch;
  };
}

export function createJsonResponse(body, init = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: init.statusText ?? "OK",
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

export function getTextContent(result) {
  assert.ok(Array.isArray(result.content), "result.content must be an array");
  const entry = result.content.find((item) => item.type === "text");
  assert.ok(entry, "result must contain a text content block");
  return entry.text;
}
