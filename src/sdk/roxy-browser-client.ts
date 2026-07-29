import { RoxyApiClient, type RoxyApiClientOptions } from "../api/index.js";
import {
  PlatformAccountDomain,
  ProfileDomain,
  ProjectDomain,
  ProxyDomain,
  WorkspaceDomain,
} from "../domains/browser/index.js";

export class RoxyBrowserClient {
  readonly api: RoxyApiClient;
  readonly workspaces: WorkspaceDomain;
  readonly projects: ProjectDomain;
  readonly profiles: ProfileDomain;
  readonly proxies: ProxyDomain;
  readonly platformAccounts: PlatformAccountDomain;

  constructor(options: RoxyApiClientOptions = {}) {
    this.api = new RoxyApiClient(options);
    this.workspaces = new WorkspaceDomain(this.api);
    this.projects = new ProjectDomain(this.api);
    this.profiles = new ProfileDomain(this.api);
    this.proxies = new ProxyDomain(this.api);
    this.platformAccounts = new PlatformAccountDomain(this.api);
  }

  labels = {
    list: async () => {
      const response = await this.api.browser.labels({});
      if (response.code !== 0) throw new Error(response.msg);
      return response.data ?? [];
    },
  };
}
