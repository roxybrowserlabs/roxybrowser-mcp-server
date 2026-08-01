import { RoxyApiTransport, withDefaultWorkspace } from "./transport.js";
import type {
  AccountBatchCreateRequest,
  AccountBatchCreateResponse,
  AccountCreateData,
  AccountCreateRequest,
  AccountCreateResponse,
  AccountDeleteRequest,
  AccountDeleteResponse,
  AccountListData,
  AccountListRequest,
  AccountListResponse,
  AccountModifyRequest,
  AccountModifyResponse,
  BrowserAccountListData,
  BrowserAccountListRequest,
  BrowserAccountListResponse,
  HealthResponse,
  LabelListRequest,
  LabelListResponse,
  ProfileCreateData,
  ProfileCreateRequest,
  ProfileCreateResponse,
  ProfileCloseRequest,
  ProfileCloseResponse,
  ProfileClearLocalCacheRequest,
  ProfileClearLocalCacheResponse,
  ProfileClearServerCacheRequest,
  ProfileClearServerCacheResponse,
  ProfileConnectionInfoData,
  ProfileConnectionInfoRequest,
  ProfileConnectionInfoResponse,
  ProfileDeleteRequest,
  ProfileDeleteResponse,
  ProfileDetailData,
  ProfileDetailRequest,
  ProfileDetailResponse,
  ProfileListData,
  ProfileListRequest,
  ProfileListResponse,
  ProfileModifyRequest,
  ProfileModifyResponse,
  ProfileOpenData,
  ProfileOpenRequest,
  ProfileOpenResponse,
  ProfileRandomizeFingerprintRequest,
  ProfileRandomizeFingerprintResponse,
  PurchasedProxyListData,
  PurchasedProxyListRequest,
  PurchasedProxyListResponse,
  ProxyBatchCreateRequest,
  ProxyBatchCreateResponse,
  ProxyCreateRequest,
  ProxyCreateResponse,
  ProxyDeleteRequest,
  ProxyDeleteResponse,
  ProxyDetectChannelRequest,
  ProxyDetectRequest,
  ProxyDetectResponse,
  ProxyDetectChannelData,
  ProxyDetectChannelResponse,
  ProxyLegacyListData,
  ProxyLegacyListRequest,
  ProxyLegacyListResponse,
  ProxyListMergedData,
  ProxyListMergedRequest,
  ProxyListMergedResponse,
  ProxyModifyRequest,
  ProxyModifyResponse,
  RawLabel,
  RawProxy,
  WorkspaceListData,
  WorkspaceListRequest,
  WorkspaceListResponse,
} from "../generated/api-types.js";
import type {
  PageData,
  PageRequest,
  RawProject,
  RoxyApiClientOptions,
  RoxyApiResponse,
} from "./types.js";

type MaybeWorkspaceScoped<T extends object = Record<string, unknown>> = T extends unknown
  ? Omit<T, "workspaceId"> & { workspaceId?: number }
  : never;

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

  health(): Promise<HealthResponse> {
    return this.transport.request({ method: "GET", path: "/health" });
  }
}

export class WorkspaceApi {
  constructor(private readonly transport: RoxyApiTransport) {}

  list(params: WorkspaceListRequest = {}): Promise<WorkspaceListResponse> {
    return this.transport.request<WorkspaceListData>({
      method: "GET",
      path: "/browser/workspace",
      params,
    }) as Promise<WorkspaceListResponse>;
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

  list(params: MaybeWorkspaceScoped<ProfileListRequest>): Promise<ProfileListResponse> {
    return this.transport.request<ProfileListData>({
      method: "GET",
      path: "/browser/list_v3",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<ProfileListResponse>;
  }

  detail(params: MaybeWorkspaceScoped<ProfileDetailRequest>): Promise<ProfileDetailResponse> {
    return this.transport.request<ProfileDetailData>({
      method: "GET",
      path: "/browser/detail",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<ProfileDetailResponse>;
  }

  create(params: MaybeWorkspaceScoped<ProfileCreateRequest>): Promise<ProfileCreateResponse> {
    return this.transport.request<ProfileCreateData>({
      method: "POST",
      path: "/browser/create",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<ProfileCreateResponse>;
  }

  modify(params: MaybeWorkspaceScoped<ProfileModifyRequest>): Promise<ProfileModifyResponse> {
    return this.transport.request<ProfileCreateData>({
      method: "POST",
      path: "/browser/mdf",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<ProfileModifyResponse>;
  }

  open(params: MaybeWorkspaceScoped<ProfileOpenRequest>): Promise<ProfileOpenResponse> {
    return this.transport.request<ProfileOpenData>({
      method: "POST",
      path: "/browser/open",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<ProfileOpenResponse>;
  }

  close(params: ProfileCloseRequest): Promise<ProfileCloseResponse> {
    return this.transport.request({ method: "POST", path: "/browser/close", params });
  }

  delete(params: MaybeWorkspaceScoped<ProfileDeleteRequest>): Promise<ProfileDeleteResponse> {
    return this.transport.request({
      method: "POST",
      path: "/browser/delete",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<ProfileDeleteResponse>;
  }

  clearLocalCache(
    params: MaybeWorkspaceScoped<ProfileClearLocalCacheRequest>,
  ): Promise<ProfileClearLocalCacheResponse> {
    return this.transport.request({
      method: "POST",
      path: "/browser/clear_local_cache",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<ProfileClearLocalCacheResponse>;
  }

  clearServerCache(
    params: MaybeWorkspaceScoped<ProfileClearServerCacheRequest>,
  ): Promise<ProfileClearServerCacheResponse> {
    return this.transport.request({
      method: "POST",
      path: "/browser/clear_server_cache",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<ProfileClearServerCacheResponse>;
  }

  randomEnv(
    params: MaybeWorkspaceScoped<ProfileRandomizeFingerprintRequest>,
  ): Promise<ProfileRandomizeFingerprintResponse> {
    return this.transport.request({
      method: "POST",
      path: "/browser/random_env",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<ProfileRandomizeFingerprintResponse>;
  }

  connectionInfo(
    params: ProfileConnectionInfoRequest = {},
  ): Promise<ProfileConnectionInfoResponse> {
    return this.transport.request<ProfileConnectionInfoData>({
      method: "GET",
      path: "/browser/connection_info",
      params,
    }) as Promise<ProfileConnectionInfoResponse>;
  }

  labels(params: MaybeWorkspaceScoped<LabelListRequest> = {}): Promise<LabelListResponse> {
    return this.transport.request<RawLabel[]>({
      method: "GET",
      path: "/browser/label",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<LabelListResponse>;
  }

  accounts(
    params: MaybeWorkspaceScoped<BrowserAccountListRequest>,
  ): Promise<BrowserAccountListResponse> {
    return this.transport.request<BrowserAccountListData>({
      method: "GET",
      path: "/browser/account",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<BrowserAccountListResponse>;
  }
}

export class ProxyApi {
  constructor(private readonly transport: RoxyApiTransport) {}

  detectChannels(
    params: MaybeWorkspaceScoped<ProxyDetectChannelRequest> = {},
  ): Promise<ProxyDetectChannelResponse> {
    return this.transport.request<ProxyDetectChannelData>({
      method: "GET",
      path: "/proxy/detect_channel",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<ProxyDetectChannelResponse>;
  }

  /** @deprecated Use listMerged() instead. */
  list(params: MaybeWorkspaceScoped<ProxyLegacyListRequest>): Promise<ProxyLegacyListResponse> {
    return this.transport.request<ProxyLegacyListData>({
      method: "GET",
      path: "/proxy/list",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<ProxyLegacyListResponse>;
  }

  listMerged(
    params: MaybeWorkspaceScoped<ProxyListMergedRequest>,
  ): Promise<ProxyListMergedResponse> {
    return this.transport.request<ProxyListMergedData>({
      method: "GET",
      path: "/proxy/list_merged",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<ProxyListMergedResponse>;
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

  create(params: MaybeWorkspaceScoped<ProxyCreateRequest>): Promise<ProxyCreateResponse> {
    return this.transport.request({
      method: "POST",
      path: "/proxy/create",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<ProxyCreateResponse>;
  }

  batchCreate(
    params: MaybeWorkspaceScoped<ProxyBatchCreateRequest>,
  ): Promise<ProxyBatchCreateResponse> {
    return this.transport.request({
      method: "POST",
      path: "/proxy/batch_create",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<ProxyBatchCreateResponse>;
  }

  detect(params: MaybeWorkspaceScoped<ProxyDetectRequest>): Promise<ProxyDetectResponse> {
    return this.transport.request({
      method: "POST",
      path: "/proxy/detect",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<ProxyDetectResponse>;
  }

  modify(params: MaybeWorkspaceScoped<ProxyModifyRequest>): Promise<ProxyModifyResponse> {
    return this.transport.request({
      method: "POST",
      path: "/proxy/modify",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<ProxyModifyResponse>;
  }

  delete(params: MaybeWorkspaceScoped<ProxyDeleteRequest>): Promise<ProxyDeleteResponse> {
    return this.transport.request({
      method: "POST",
      path: "/proxy/delete",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<ProxyDeleteResponse>;
  }

  /** @deprecated Use listMerged() instead. */
  boughtList(
    params: MaybeWorkspaceScoped<PurchasedProxyListRequest>,
  ): Promise<PurchasedProxyListResponse> {
    return this.transport.request<PurchasedProxyListData>({
      method: "GET",
      path: "/proxy/bought_list",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<PurchasedProxyListResponse>;
  }
}

export class AccountApi {
  constructor(private readonly transport: RoxyApiTransport) {}

  list(params: MaybeWorkspaceScoped<AccountListRequest>): Promise<AccountListResponse> {
    return this.transport.request<AccountListData>({
      method: "GET",
      path: "/account/list",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<AccountListResponse>;
  }

  create(params: MaybeWorkspaceScoped<AccountCreateRequest>): Promise<AccountCreateResponse> {
    return this.transport.request<AccountCreateData>({
      method: "POST",
      path: "/account/create",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<AccountCreateResponse>;
  }

  batchCreate(
    params: MaybeWorkspaceScoped<AccountBatchCreateRequest>,
  ): Promise<AccountBatchCreateResponse> {
    return this.transport.request({
      method: "POST",
      path: "/account/batch_create",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<AccountBatchCreateResponse>;
  }

  modify(params: MaybeWorkspaceScoped<AccountModifyRequest>): Promise<AccountModifyResponse> {
    return this.transport.request({
      method: "POST",
      path: "/account/modify",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<AccountModifyResponse>;
  }

  delete(params: MaybeWorkspaceScoped<AccountDeleteRequest>): Promise<AccountDeleteResponse> {
    return this.transport.request({
      method: "POST",
      path: "/account/delete",
      params: withDefaultWorkspace(params, this.transport.workspaceId),
    }) as Promise<AccountDeleteResponse>;
  }
}
