import { RoxyBrowserClient } from "./roxy-browser-client.js";
import type { RoxyApiClientOptions } from "../api/index.js";
import { CommerceAccountDomain } from "../domains/commerce/accounts.js";

export class RoxyCommerceClient {
  readonly browser: RoxyBrowserClient;
  readonly accounts: CommerceAccountDomain;
  readonly proxies: RoxyBrowserClient["proxies"];
  readonly platformCredentials: RoxyBrowserClient["platformAccounts"];

  constructor(options: RoxyApiClientOptions = {}) {
    this.browser = new RoxyBrowserClient(options);
    this.accounts = new CommerceAccountDomain(this.browser.profiles);
    this.proxies = this.browser.proxies;
    this.platformCredentials = this.browser.platformAccounts;
  }
}
