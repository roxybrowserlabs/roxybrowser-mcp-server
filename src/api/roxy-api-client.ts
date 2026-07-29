import { RoxyApiTransport, withDefaultWorkspace } from "./transport.js";
import type {
  PageData,
  PageRequest,
  RawBrowserConnection,
  RawBrowserProfile,
  RawLabel,
  RawPlatformAccount,
  RawProject,
  RawProxy,
  RawWorkspace,
  RoxyApiClientOptions,
  RoxyApiResponse,
} from "./types.js";

type MaybeWorkspaceScoped<T extends object = Record<string, unknown>> = Omit<T, "workspaceId"> & {
  workspaceId?: number;
};

export class RoxyApiClient {
  readonly transport: RoxyApiTransport;
  readonly browser: BrowserApi;
  readonly proxy: ProxyApi;
  readonly account: AccountApi;
  readonly workspace: WorkspaceApi;

  constructor(options: RoxyApiClientOptions = {}) {
    this.transport = new RoxyApiTransport(options);
    this.browser = new BrowserApi(this.transport);
    this.proxy = new ProxyApi(this.transport);
    this.account = new AccountApi(this.transport);
    this.workspace = new WorkspaceApi(this.transport);
  }

  health(): Promise<RoxyApiResponse> {
    return this.transport.request({ method: "GET", path: "/health" });
  }
}

export class WorkspaceApi {
  constructor(private readonly transport: RoxyApiTransport) {}

  list(params: PageRequest = {}): Promise<RoxyApiResponse<PageData<RawWorkspace>>> {
    return this.transport.request({ method: "GET", path: "/browser/workspace", params });
  }

  projects(
    params: MaybeWorkspaceScoped<PageRequest & { workspaceId: number }>,
  ): Promise<RoxyApiResponse<PageData<RawProject> | RawProject[]>> {
    return this.transport.request({
      method: "GET",
      path: "/project/list",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }
}

export class BrowserApi {
  constructor(private readonly transport: RoxyApiTransport) {}

  list(
    params: MaybeWorkspaceScoped<PageRequest & Record<string, unknown> & { workspaceId: number }>,
  ): Promise<RoxyApiResponse<PageData<RawBrowserProfile>>> {
    return this.transport.request({
      method: "GET",
      path: "/browser/list_v3",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }

  detail(
    params: MaybeWorkspaceScoped<{ workspaceId: number; dirId: string; windowSortNum?: string }>,
  ): Promise<RoxyApiResponse<PageData<RawBrowserProfile>>> {
    return this.transport.request({
      method: "GET",
      path: "/browser/detail",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }

  create(
    params: MaybeWorkspaceScoped<Record<string, unknown> & { workspaceId: number }>,
  ): Promise<RoxyApiResponse<{ dirId: string }>> {
    return this.transport.request({
      method: "POST",
      path: "/browser/create",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }

  modify(
    params: MaybeWorkspaceScoped<Record<string, unknown> & { workspaceId: number; dirId: string }>,
  ): Promise<RoxyApiResponse<{ dirId: string }>> {
    return this.transport.request({
      method: "POST",
      path: "/browser/mdf",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }

  open(
    params: MaybeWorkspaceScoped<{
      workspaceId: number;
      dirId: string;
      args?: string[];
      forceOpen?: boolean;
      headless?: boolean;
    }>,
  ): Promise<RoxyApiResponse<RawBrowserConnection>> {
    return this.transport.request({
      method: "POST",
      path: "/browser/open",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }

  close(params: { dirId: string }): Promise<RoxyApiResponse> {
    return this.transport.request({ method: "POST", path: "/browser/close", params });
  }

  delete(
    params: MaybeWorkspaceScoped<{ workspaceId: number; dirIds: string[]; isSoftDelete?: boolean }>,
  ): Promise<RoxyApiResponse> {
    return this.transport.request({
      method: "POST",
      path: "/browser/delete",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }

  clearLocalCache(
    params: MaybeWorkspaceScoped<{ workspaceId?: number; dirIds: string[]; type?: string }>,
  ): Promise<RoxyApiResponse> {
    return this.transport.request({
      method: "POST",
      path: "/browser/clear_local_cache",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }

  clearServerCache(
    params: MaybeWorkspaceScoped<{ workspaceId: number; dirIds: string[] }>,
  ): Promise<RoxyApiResponse> {
    return this.transport.request({
      method: "POST",
      path: "/browser/clear_server_cache",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }

  randomEnv(
    params: MaybeWorkspaceScoped<{ workspaceId: number; dirId: string }>,
  ): Promise<RoxyApiResponse> {
    return this.transport.request({
      method: "POST",
      path: "/browser/random_env",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }

  connectionInfo(
    params: { dirIds?: string } = {},
  ): Promise<RoxyApiResponse<RawBrowserConnection[]>> {
    return this.transport.request({ method: "GET", path: "/browser/connection_info", params });
  }

  labels(
    params: MaybeWorkspaceScoped<{ workspaceId: number }>,
  ): Promise<RoxyApiResponse<RawLabel[]>> {
    return this.transport.request({
      method: "GET",
      path: "/browser/label",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }

  accounts(
    params: MaybeWorkspaceScoped<PageRequest & { workspaceId: number; accountId?: number }>,
  ): Promise<RoxyApiResponse<PageData<RawPlatformAccount>>> {
    return this.transport.request({
      method: "GET",
      path: "/browser/account",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }
}

export class ProxyApi {
  constructor(private readonly transport: RoxyApiTransport) {}

  detectChannels(): Promise<
    RoxyApiResponse<Array<{ label: string; type: string; value: string }>>
  > {
    return this.transport.request({ method: "GET", path: "/proxy/detect_channel" });
  }

  listMerged(
    params: MaybeWorkspaceScoped<PageRequest & Record<string, unknown> & { workspaceId: number }>,
  ): Promise<RoxyApiResponse<PageData<RawProxy>>> {
    return this.transport.request({
      method: "GET",
      path: "/proxy/list_merged",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }

  detail(
    params: MaybeWorkspaceScoped<{ workspaceId: number; id: number }>,
  ): Promise<RoxyApiResponse<RawProxy | PageData<RawProxy>>> {
    return this.transport.request({
      method: "GET",
      path: "/proxy/detail",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }

  create(
    params: MaybeWorkspaceScoped<Record<string, unknown> & { workspaceId: number }>,
  ): Promise<RoxyApiResponse> {
    return this.transport.request({
      method: "POST",
      path: "/proxy/create",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }

  batchCreate(
    params: MaybeWorkspaceScoped<{
      workspaceId: number;
      checkChannel?: string;
      proxyList: Array<Record<string, unknown>>;
    }>,
  ): Promise<RoxyApiResponse<unknown[]>> {
    return this.transport.request({
      method: "POST",
      path: "/proxy/batch_create",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }

  detect(
    params: MaybeWorkspaceScoped<{ workspaceId: number; id: number }>,
  ): Promise<RoxyApiResponse<RawProxy>> {
    return this.transport.request({
      method: "POST",
      path: "/proxy/detect",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }

  modify(
    params: MaybeWorkspaceScoped<Record<string, unknown> & { workspaceId: number; id: number }>,
  ): Promise<RoxyApiResponse> {
    return this.transport.request({
      method: "POST",
      path: "/proxy/modify",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }

  delete(
    params: MaybeWorkspaceScoped<{ workspaceId: number; ids: number[] }>,
  ): Promise<RoxyApiResponse> {
    return this.transport.request({
      method: "POST",
      path: "/proxy/delete",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }
}

export class AccountApi {
  constructor(private readonly transport: RoxyApiTransport) {}

  list(
    params: MaybeWorkspaceScoped<PageRequest & { workspaceId: number }>,
  ): Promise<RoxyApiResponse<PageData<RawPlatformAccount>>> {
    return this.transport.request({
      method: "GET",
      path: "/account/list",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }

  create(
    params: MaybeWorkspaceScoped<Record<string, unknown> & { workspaceId: number }>,
  ): Promise<RoxyApiResponse<{ platform_id: number }>> {
    return this.transport.request({
      method: "POST",
      path: "/account/create",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }

  batchCreate(
    params: MaybeWorkspaceScoped<{
      workspaceId: number;
      accountList: Array<Record<string, unknown>>;
    }>,
  ): Promise<RoxyApiResponse> {
    return this.transport.request({
      method: "POST",
      path: "/account/batch_create",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }

  modify(
    params: MaybeWorkspaceScoped<Record<string, unknown> & { workspaceId: number; id: number }>,
  ): Promise<RoxyApiResponse> {
    return this.transport.request({
      method: "POST",
      path: "/account/modify",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }

  delete(
    params: MaybeWorkspaceScoped<{ workspaceId: number; ids: number[] }>,
  ): Promise<RoxyApiResponse> {
    return this.transport.request({
      method: "POST",
      path: "/account/delete",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    });
  }
}
