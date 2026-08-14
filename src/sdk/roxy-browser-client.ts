import { RoxyApiClient, type RoxyApiClientOptions } from "../api/index.js";
import { GeneratedRoxyBrowserClient } from "../generated/roxy-browser-client.js";
import {
  getRoxyCapability,
  isRoxyCapabilitySupported,
  ROXY_CAPABILITIES,
  ROXY_OPENAPI_VERSION,
} from "../version.js";
import {
  LabelDomain,
  PlatformAccountDomain,
  ProfileDomain,
  ProjectDomain,
  ProxyDomain,
  WorkspaceDomain,
} from "../domains/browser/index.js";

export interface RoxyBrowserClientOptions extends RoxyApiClientOptions {
  /** Current RoxyBrowser app version used for capability checks. */
  roxyBrowserVersion?: string;
  /** @deprecated Use roxyBrowserVersion. */
  agentVersion?: string;
}

export class RoxyBrowserClient extends GeneratedRoxyBrowserClient {
  static readonly version = ROXY_OPENAPI_VERSION;
  static readonly capabilities = ROXY_CAPABILITIES;

  readonly version = ROXY_OPENAPI_VERSION;
  readonly capabilities = ROXY_CAPABILITIES;
  readonly roxyBrowserVersion?: string;
  readonly workspaces: WorkspaceDomain;
  readonly projects: ProjectDomain;
  readonly profiles: ProfileDomain;
  readonly proxies: ProxyDomain;
  readonly platformAccounts: PlatformAccountDomain;
  readonly labels: LabelDomain;

  constructor(options: RoxyBrowserClientOptions = {}) {
    const api = new RoxyApiClient(options);
    super(api);
    this.roxyBrowserVersion = options.roxyBrowserVersion ?? options.agentVersion;
    this.workspaces = new WorkspaceDomain(this.api);
    this.projects = new ProjectDomain(this.api);
    this.profiles = new ProfileDomain(this.api);
    this.proxies = new ProxyDomain(this.api);
    this.platformAccounts = new PlatformAccountDomain(this.api);
    this.labels = new LabelDomain(this.api);
  }

  getCapability(operationId: string) {
    return getRoxyCapability(operationId);
  }

  supports(operationId: string, roxyBrowserVersion = this.roxyBrowserVersion): boolean {
    return isRoxyCapabilitySupported(operationId, roxyBrowserVersion);
  }
}
