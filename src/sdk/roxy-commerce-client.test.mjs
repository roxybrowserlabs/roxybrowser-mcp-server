import assert from "node:assert/strict";
import { describe, test } from "vite-plus/test";
import { RoxyCommerceClient } from "../../lib/index.js";

describe("RoxyCommerceClient", () => {
  test("is an empty product shell until ecommerce tools are implemented", () => {
    const commerce = new RoxyCommerceClient({ apiKey: "secret-token", workspaceId: 77 });

    assert.deepEqual(Object.keys(commerce).sort(), []);
    assert.equal("accounts" in commerce, false);
    assert.equal("proxies" in commerce, false);
    assert.equal("platformCredentials" in commerce, false);
  });
});
