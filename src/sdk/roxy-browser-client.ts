import { RoxyApiClient, type RoxyApiClientOptions } from "../api/index.js";
import { GeneratedRoxyBrowserClient } from "../generated/roxy-browser-client.js";
import {
  LabelDomain,
  PlatformAccountDomain,
  ProfileDomain,
  ProjectDomain,
  ProxyDomain,
  WorkspaceDomain,
} from "../domains/browser/index.js";

export class RoxyBrowserClient extends GeneratedRoxyBrowserClient {
  readonly workspaces: WorkspaceDomain;
  readonly projects: ProjectDomain;
  readonly profiles: ProfileDomain;
  readonly proxies: ProxyDomain;
  readonly platformAccounts: PlatformAccountDomain;
  readonly labels: LabelDomain;

  constructor(options: RoxyApiClientOptions = {}) {
    const api = new RoxyApiClient(options);
    super(api);
    this.workspaces = new WorkspaceDomain(this.api);
    this.projects = new ProjectDomain(this.api);
    this.profiles = new ProfileDomain(this.api);
    this.proxies = new ProxyDomain(this.api);
    this.platformAccounts = new PlatformAccountDomain(this.api);
    this.labels = new LabelDomain(this.api);
  }
}
