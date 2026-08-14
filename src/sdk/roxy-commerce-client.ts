import { RoxyBrowserClient, type RoxyBrowserClientOptions } from "./roxy-browser-client.js";
import { CommerceAccountDomain } from "../domains/commerce/accounts.js";
import {
  getRoxyCapability,
  isRoxyCapabilitySupported,
  ROXY_CAPABILITIES,
  ROXY_OPENAPI_VERSION,
} from "../version.js";

export class RoxyCommerceClient {
  static readonly version = ROXY_OPENAPI_VERSION;
  static readonly capabilities = ROXY_CAPABILITIES;

  readonly version = ROXY_OPENAPI_VERSION;
  readonly capabilities = ROXY_CAPABILITIES;
  readonly roxyBrowserVersion?: string;
  readonly browser: RoxyBrowserClient;
  readonly accounts: CommerceAccountDomain;
  readonly proxies: RoxyBrowserClient["proxies"];
  readonly platformCredentials: RoxyBrowserClient["platformAccounts"];

  constructor(options: RoxyBrowserClientOptions = {}) {
    this.roxyBrowserVersion = options.roxyBrowserVersion ?? options.agentVersion;
    this.browser = new RoxyBrowserClient(options);
    this.accounts = new CommerceAccountDomain(this.browser.profiles);
    this.proxies = this.browser.proxies;
    this.platformCredentials = this.browser.platformAccounts;
  }

  getCapability(operationId: string) {
    return getRoxyCapability(operationId);
  }

  supports(operationId: string, roxyBrowserVersion = this.roxyBrowserVersion): boolean {
    return Boolean(roxyBrowserVersion && isRoxyCapabilitySupported(operationId, roxyBrowserVersion));
  }
}
