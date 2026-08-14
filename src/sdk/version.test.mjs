import assert from "node:assert/strict";
import { describe, test } from "vite-plus/test";
import {
  getRoxyCapability,
  isRoxyCapabilitySupported,
  isVersionAtLeast,
  ROXY_CAPABILITIES,
  ROXY_OPENAPI_VERSION,
  RoxyBrowserClient,
  RoxyCommerceClient,
} from "../../lib/index.js";

describe("versioned SDK capabilities", () => {
  test("exports package version and shared capability metadata", () => {
    const browser = new RoxyBrowserClient({
      apiKey: "secret-token",
      roxyBrowserVersion: "4.0.4",
    });
    const commerce = new RoxyCommerceClient({
      apiKey: "secret-token",
      roxyBrowserVersion: "4.0.4",
    });

    assert.equal(browser.version, ROXY_OPENAPI_VERSION);
    assert.equal(RoxyBrowserClient.version, ROXY_OPENAPI_VERSION);
    assert.equal(commerce.version, ROXY_OPENAPI_VERSION);
    assert.equal(RoxyCommerceClient.version, ROXY_OPENAPI_VERSION);
    assert.equal(browser.capabilities, ROXY_CAPABILITIES);
    assert.equal(commerce.capabilities, ROXY_CAPABILITIES);
    assert.equal(browser.roxyBrowserVersion, "4.0.4");
    assert.equal(commerce.roxyBrowserVersion, "4.0.4");
  });

  test("checks whether an operation exists for a given version", () => {
    assert.deepEqual(getRoxyCapability("browser.profile.open"), {
      operationId: "browser.profile.open",
      endpoint: "POST /browser/open",
      sinceRoxyBrowserVersion: "3.0.0",
    });
    assert.equal(isRoxyCapabilitySupported("browser.profile.open", "3.0.0"), true);
    assert.equal(isRoxyCapabilitySupported("browser.profile.open", "2.9.9"), false);
    assert.equal(isRoxyCapabilitySupported("browser.missing", "9.0.0"), false);

    const client = new RoxyBrowserClient({
      apiKey: "secret-token",
      roxyBrowserVersion: "3.0.0",
    });
    assert.equal(client.supports("browser.profile.open"), true);
    assert.equal(client.supports("browser.profile.open", "3.0.0"), true);
    assert.equal(client.supports("browser.profile.open", "2.9.9"), false);
  });

  test("uses compare-versions semantics for prerelease versions", () => {
    assert.equal(isVersionAtLeast("3.0.1-beta.3", "3.0.1-beta.2"), true);
    assert.equal(isVersionAtLeast("3.0.1-beta.2", "3.0.1-beta.3"), false);
    assert.equal(isVersionAtLeast("3.0.1", "3.0.1-beta.3"), true);
  });
});
