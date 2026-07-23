export type JsonObject = Record<string, unknown>

export interface RoxyOpenAPIOptions {
  apikey?: string
  apiKey?: string
  baseUrl?: string
  apiHost?: string
  timeout?: number
  fetch?: typeof fetch
}

export interface RoxyApiResponse<T = unknown> {
  code: number
  msg: string
  data?: T
}

export interface PageParams {
  page_index?: number
  page_size?: number
}

export interface PaginatedData<T> {
  total: number
  rows: T[]
}

export interface WorkspaceListParams extends PageParams {}

export interface WorkspaceProject {
  projectId: number
  projectName: string
}

export interface Workspace {
  id: number
  workspaceName: string
  project_details: WorkspaceProject[]
}

export interface BrowserAccountListParams extends PageParams {
  workspaceId: number
  accountId?: number
}

export interface CookieItem extends JsonObject {
  name: string
  value: string
  domain: string
}

export interface BrowserAccount {
  id: number
  platformUrl: string
  platformUserName: string
  platformPassword: string
  platformEfa: string
  platformCookies: CookieItem[]
  platformName?: string
  platformRemarks: string
  createTime: string
  updateTime: string
}

export interface LabelListParams {
  workspaceId: number
}

export interface BrowserLabel {
  id: number
  color: string
  name: string
}

export interface BrowserListParams extends PageParams {
  workspaceId: number
  dirIds?: string
  windowName?: string
  sortNums?: string
  os?: string
  projectIds?: string
  windowRemark?: string
}

export interface BrowserSummary extends JsonObject {
  dirId: string
  windowSortNum: number
  windowName: string
  coreVersion: string
  coreType?: string
  os: string
  osVersion: string
  windowRemark: string
  createTime: string
  updateTime: string
  userName: string
}

export interface BrowserDetailParams {
  workspaceId: number
  dirId: string
}

export interface WindowPlatformAccount extends JsonObject {
  id?: number
  platformUrl?: string
  platformUserName?: string
  platformPassword?: string
  platformEfa?: string
  platformRemarks?: string
}

export interface BrowserProxyInfo extends JsonObject {
  moduleId?: number
  proxyMethod?: 'custom' | 'choose' | string
  proxyCategory?: 'noproxy' | 'HTTP' | 'HTTPS' | 'SOCKS5' | 'SSH' | string
  ipType?: 'IPV4' | 'IPV6' | string
  protocol?: 'HTTP' | 'HTTPS' | 'SOCKS5' | string
  host?: string
  port?: string
  proxyUserName?: string
  proxyPassword?: string
  refreshUrl?: string
  lastIp?: string
  lastCountry?: string
  checkChannel?: string
}

export interface BrowserFingerInfo extends JsonObject {
  isLanguageBaseIp?: boolean
  language?: string
  isDisplayLanguageBaseIp?: boolean
  displayLanguage?: string
  isTimeZone?: boolean
  timeZone?: string
  position?: 0 | 1 | 2 | number
  isPositionBaseIp?: boolean
  longitude?: string
  latitude?: string
  precisionPos?: string
  forbidAudio?: boolean
  forbidImage?: boolean
  forbiddenPictureSize?: number
  forbidMedia?: boolean
  openWidth?: string
  openHeight?: string
  openBookmarks?: boolean
  positionSwitch?: boolean
  windowRatioPosition?: string
  isDisplayName?: boolean
  syncBookmark?: boolean
  syncHistory?: boolean
  syncTab?: boolean
  syncCookie?: boolean
  syncExtensions?: boolean
  syncPassword?: boolean
  syncIndexedDb?: boolean
  syncLocalStorage?: boolean
  clearCacheFile?: boolean
  clearCookie?: boolean
  clearLocalStorage?: boolean
  randomFingerprint?: boolean
  forbidSavePassword?: boolean
  stopOpenNet?: boolean
  stopOpenIP?: boolean
  stopOpenPosition?: boolean
  openWorkbench?: 0 | 1 | 2 | number
  resolutionType?: boolean
  resolutionX?: string
  resolutionY?: string
  fontType?: boolean
  webRTC?: 0 | 1 | 2 | number
  webGL?: boolean
  webGLInfo?: boolean
  webGLManufacturer?: string
  webGLRender?: string
  webGpu?: 'webgl' | 'real' | 'block' | string
  canvas?: boolean
  audioContext?: boolean
  speechVoices?: boolean
  doNotTrack?: boolean
  clientRects?: boolean
  deviceInfo?: boolean
  deviceNameSwitch?: boolean
  macInfo?: boolean
  hardwareConcurrent?: string
  deviceMemory?: string
  disableSsl?: boolean
  disableSslList?: unknown[]
  portScanProtect?: boolean
  portScanList?: string
  useGpu?: boolean
  sandboxPermission?: boolean
  startupParam?: string
  openBattery?: boolean
  openCharging?: boolean
  chargingTime?: string
  dischargingTime?: string
  level?: string
  openNetwork?: boolean
  networkType?: string
  networkSpeed?: string
  downloadSpeed?: string
  maxDownloadSpeed?: string
  latency?: string | number
  saveFlowMode?: boolean
  openBluetooth?: boolean
  bluetoothAdapter?: boolean
  blockDomainList?: string
  allowDomainList?: string
}

export interface BrowserProfileInput extends JsonObject {
  workspaceId: number
  windowName?: string
  coreVersion?: string
  coreType?: 'Chrome' | 'Firefox' | string
  os?: 'Windows' | 'macOS' | 'Linux' | 'IOS' | 'Android' | string
  osVersion?: string
  cookie?: CookieItem[] | unknown[]
  searchEngine?: 'Google' | 'Microsoft Bing' | 'Yahoo' | 'Yandex' | 'DuckDuckGo' | string
  labelIds?: number[]
  windowPlatformList?: WindowPlatformAccount[]
  defaultOpenUrl?: string[]
  windowRemark?: string
  projectId?: number
  proxyInfo?: BrowserProxyInfo
  fingerInfo?: BrowserFingerInfo
}

export interface BrowserCreateParams extends BrowserProfileInput {}

export interface BrowserModifyParams extends BrowserProfileInput {
  dirId: string
}

export interface BrowserIdData {
  dirId: string
}

export interface BrowserDeleteParams {
  workspaceId: number
  dirIds: string[]
  isSoftDelete?: boolean
}

export interface BrowserOpenParams {
  workspaceId: number
  dirId: string
  args?: string[]
  forceOpen?: boolean
  headless?: boolean
}

export interface BrowserConnectionInfo extends JsonObject {
  ws: string
  http: string
  coreVersion: string
  driver: string
  sortNum: number
  windowName: string
  windowRemark: string
  pid: number
  dirId?: string
}

export interface BrowserCloseParams {
  dirId: string
}

export interface BrowserRandomEnvParams {
  workspaceId: number
  dirId: string
}

export interface BrowserClearLocalCacheParams {
  dirIds: string[]
  type?: 'partial' | 'all' | 'cloud' | string
  workspaceId?: number
}

export interface BrowserClearServerCacheParams {
  workspaceId: number
  dirIds: string[]
}

export interface BrowserConnectionInfoParams {
  dirIds?: string
}

export interface ProxyListParams extends PageParams {
  workspaceId: number
  type?: 'available_list' | string
  orderName?: string
  orderType?: 'asc' | 'desc' | string
  proxyType?: 0 | 1 | '0' | '1' | 'user-added' | 'proxy store' | string
  proxyBindStatus?: 0 | 1 | '0' | '1' | string
  proxyAutoRenew?: 0 | 1 | '0' | '1' | string
  country?: string
  checkStatus?: number
  check_status?: number
  startDate?: string
  start_date?: string
  endDate?: string
  end_date?: string
  checker?: string
  pageIndex?: number
  pageSize?: number
}

export interface ProxyDetectChannel extends JsonObject {
  label: string
  type: string
  value: string
}

export interface ProxyRecord extends JsonObject {
  id: number
  userId?: number
  workspaceId?: number
  canBandwidthUpgrade?: boolean
  proxyProviderId?: number
  orderNo?: string
  orderStatus?: number
  checkStatus: number
  proxyCheckChannel?: string
  checkChannel: string
  checkChannelValue: string
  lastIp: string
  lastCountry: string
  lastState: string
  lastCity: string
  ipType: string
  protocol: string
  host: string
  port: string
  proxyPassword: string
  proxyUserName: string
  refreshUrl: string
  remark: string
  country?: string
  proxyExpireStatus?: number
  checkTime: string
  renewalTime?: string
  createTime: string
  proxyMonths?: number
  updateTime: string
  expireDate?: string
  replaceStatus?: number
  proxyProviderName?: string
  proxyType?: number
  providerType?: string
  opName?: string
  giftDays?: number
  autoRenew?: number
  canRenew?: boolean
  modelParam?: string
  isDirect?: boolean
  badgeTypeDesc?: string
  dataType?: 'proxyModule' | 'buyProxy' | string
  isBind?: boolean
  bindCount?: number
  bindList?: number[]
  canRefund?: boolean
  bandwidthSpeed?: number
}

export interface ProxyInput extends JsonObject {
  checkChannel: string
  ipType: 'IPV4' | 'IPV6' | string
  protocol: 'HTTP' | 'HTTPS' | 'SOCKS5' | string
  host: string
  port: string
  proxyUserName?: string
  proxyPassword?: string
  refreshUrl?: string
  remark?: string
}

export interface ProxyCreateParams extends ProxyInput {
  workspaceId: number
}

export interface ProxyBatchCreateParams {
  workspaceId: number
  checkChannel: string
  proxyList: ProxyInput[]
}

export interface ProxyDetectParams {
  workspaceId: number
  id: number
}

export interface ProxyModifyParams extends ProxyCreateParams {
  id: number
}

export interface ProxyDeleteParams {
  workspaceId: number
  ids: number[]
}

export interface ProxyBoughtListParams extends PageParams {
  workspaceId: number
  type?: 0 | 1 | number
}

export interface BoughtProxyRecord extends JsonObject {
  id: number
  orderNo: string
  checkStatus: number
  proxyCheckChannel: string
  checkChannelValue: string
  lastIp: string
  lastCountry: string
  lastState: string
  lastCity: string
  proxyProviderName: string
  providerType: string
  ipType: string
  protocol: string
  host: string
  port: string
  proxyUserName: string
  proxyPassword: string
  remark: string
  checkTime: string
  createTime: string
  updateTime: string
  expireDate: string
}

export interface AccountListParams extends PageParams {
  workspaceId: number
}

export interface PlatformAccount extends JsonObject {
  id: number
  platformUrl: string
  platformUserName: string
  platformPassword: string
  platformEfa: string
  platformCookies?: CookieItem[]
  platformRemarks: string
  createTime: string
  updateTime: string
}

export interface AccountInput extends JsonObject {
  platformUrl: string
  platformUserName?: string
  platformPassword?: string
  platformEfa?: string
  platformRemarks?: string
}

export interface AccountCreateParams extends AccountInput {
  workspaceId: number
}

export interface AccountCreateData {
  platform_id: number
}

export interface AccountBatchCreateParams {
  workspaceId: number
  accountList: AccountInput[]
}

export interface AccountModifyParams extends AccountCreateParams {
  id: number
}

export interface AccountDeleteParams {
  workspaceId: number
  ids: number[]
}

interface RequestOptions {
  method: 'GET' | 'POST'
  path: string
  params?: object
}

function appendQuery(url: URL, params?: object): void {
  if (!params)
    return

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null)
      continue
    url.searchParams.append(key, Array.isArray(value) ? value.join(',') : String(value))
  }
}

export class RoxyOpenAPI {
  readonly apiKey: string
  readonly baseUrl: string
  readonly timeout: number

  readonly browser: RoxyBrowserAPI
  readonly proxy: RoxyProxyAPI
  readonly account: RoxyAccountAPI
  readonly workspace: RoxyWorkspaceAPI

  private readonly fetchImpl: typeof fetch

  constructor(options: RoxyOpenAPIOptions = {}) {
    this.apiKey = options.apiKey ?? options.apikey ?? ''
    this.baseUrl = options.baseUrl ?? options.apiHost ?? 'http://127.0.0.1:50000'
    this.timeout = options.timeout ?? 30_000
    this.fetchImpl = options.fetch ?? fetch

    this.browser = new RoxyBrowserAPI(this)
    this.proxy = new RoxyProxyAPI(this)
    this.account = new RoxyAccountAPI(this)
    this.workspace = new RoxyWorkspaceAPI(this)
  }

  async health(): Promise<RoxyApiResponse> {
    return this.get('/health')
  }

  async get<T = unknown>(path: string, params?: object): Promise<RoxyApiResponse<T>> {
    return this.request<T>({ method: 'GET', path, params })
  }

  async post<T = unknown>(path: string, body?: object): Promise<RoxyApiResponse<T>> {
    return this.request<T>({ method: 'POST', path, params: body })
  }

  async request<T = unknown>({ method, path, params }: RequestOptions): Promise<RoxyApiResponse<T>> {
    if (!this.apiKey.trim()) {
      throw new Error('RoxyOpenAPI apikey is required')
    }

    const url = new URL(path, this.baseUrl.replace(/\/$/, '') + '/')
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    const init: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        token: this.apiKey,
      },
      signal: controller.signal,
    }

    if (method === 'GET') {
      appendQuery(url, params)
    }
    else {
      init.body = JSON.stringify(params ?? {})
    }

    try {
      const response = await this.fetchImpl(url.toString(), init)
      if (!response.ok) {
        const responseText = await response.text().catch(() => '')
        throw new Error(`RoxyOpenAPI request failed: HTTP ${response.status} ${response.statusText}${responseText ? ` ${responseText}` : ''}`)
      }

      return await response.json() as RoxyApiResponse<T>
    }
    finally {
      clearTimeout(timeoutId)
    }
  }
}

export class RoxyWorkspaceAPI {
  constructor(private readonly client: RoxyOpenAPI) {}

  list(params: WorkspaceListParams = {}): Promise<RoxyApiResponse<PaginatedData<Workspace>>> {
    return this.client.get('/browser/workspace', params)
  }
}

export class RoxyBrowserAPI {
  constructor(private readonly client: RoxyOpenAPI) {}

  health(): Promise<RoxyApiResponse> {
    return this.client.health()
  }

  workspace(params: WorkspaceListParams = {}): Promise<RoxyApiResponse<PaginatedData<Workspace>>> {
    return this.client.get('/browser/workspace', params)
  }

  accounts(params: BrowserAccountListParams): Promise<RoxyApiResponse<PaginatedData<BrowserAccount>>> {
    return this.client.get('/browser/account', params)
  }

  labels(params: LabelListParams): Promise<RoxyApiResponse<BrowserLabel[]>> {
    return this.client.get('/browser/label', params)
  }

  list(params: BrowserListParams): Promise<RoxyApiResponse<PaginatedData<BrowserSummary>>> {
    return this.client.get('/browser/list_v3', params)
  }

  detail(params: BrowserDetailParams): Promise<RoxyApiResponse<PaginatedData<BrowserSummary>>> {
    return this.client.get('/browser/detail', params)
  }

  create(params: BrowserCreateParams): Promise<RoxyApiResponse<BrowserIdData>> {
    return this.client.post('/browser/create', params)
  }

  modify(params: BrowserModifyParams): Promise<RoxyApiResponse<BrowserIdData>> {
    return this.client.post('/browser/mdf', params)
  }

  update(params: BrowserModifyParams): Promise<RoxyApiResponse<BrowserIdData>> {
    return this.modify(params)
  }

  delete(params: BrowserDeleteParams): Promise<RoxyApiResponse> {
    return this.client.post('/browser/delete', params)
  }

  open(params: BrowserOpenParams): Promise<RoxyApiResponse<BrowserConnectionInfo>> {
    return this.client.post('/browser/open', params)
  }

  close(params: BrowserCloseParams): Promise<RoxyApiResponse> {
    return this.client.post('/browser/close', params)
  }

  randomEnv(params: BrowserRandomEnvParams): Promise<RoxyApiResponse> {
    return this.client.post('/browser/random_env', params)
  }

  randomFingerprint(params: BrowserRandomEnvParams): Promise<RoxyApiResponse> {
    return this.randomEnv(params)
  }

  clearLocalCache(params: BrowserClearLocalCacheParams): Promise<RoxyApiResponse> {
    return this.client.post('/browser/clear_local_cache', params)
  }

  clearServerCache(params: BrowserClearServerCacheParams): Promise<RoxyApiResponse> {
    return this.client.post('/browser/clear_server_cache', params)
  }

  connectionInfo(params: BrowserConnectionInfoParams = {}): Promise<RoxyApiResponse<BrowserConnectionInfo[]>> {
    return this.client.get('/browser/connection_info', params)
  }
}

function normalizeProxyListParams(params: ProxyListParams): object {
  const {
    pageIndex,
    pageSize,
    checkStatus,
    startDate,
    endDate,
    proxyType,
    ...rest
  } = params

  return {
    ...rest,
    page_index: rest.page_index ?? pageIndex,
    page_size: rest.page_size ?? pageSize,
    check_status: rest.check_status ?? checkStatus,
    start_date: rest.start_date ?? startDate,
    end_date: rest.end_date ?? endDate,
    proxyType: proxyType === 'user-added'
      ? '0'
      : proxyType === 'proxy store'
        ? '1'
        : proxyType,
  }
}

export class RoxyProxyAPI {
  constructor(private readonly client: RoxyOpenAPI) {}

  detectChannel(): Promise<RoxyApiResponse<ProxyDetectChannel[]>> {
    return this.client.get('/proxy/detect_channel')
  }

  list(params: ProxyListParams): Promise<RoxyApiResponse<PaginatedData<ProxyRecord>>> {
    return this.client.get('/proxy/list_merged', normalizeProxyListParams(params))
  }

  userList(params: ProxyListParams): Promise<RoxyApiResponse<PaginatedData<ProxyRecord>>> {
    return this.client.get('/proxy/list', normalizeProxyListParams(params))
  }

  create(params: ProxyCreateParams): Promise<RoxyApiResponse> {
    return this.client.post('/proxy/create', params)
  }

  batchCreate(params: ProxyBatchCreateParams): Promise<RoxyApiResponse> {
    return this.client.post('/proxy/batch_create', params)
  }

  detect(params: ProxyDetectParams): Promise<RoxyApiResponse> {
    return this.client.post('/proxy/detect', params)
  }

  modify(params: ProxyModifyParams): Promise<RoxyApiResponse> {
    return this.client.post('/proxy/modify', params)
  }

  update(params: ProxyModifyParams): Promise<RoxyApiResponse> {
    return this.modify(params)
  }

  delete(params: ProxyDeleteParams): Promise<RoxyApiResponse> {
    return this.client.post('/proxy/delete', params)
  }

  boughtList(params: ProxyBoughtListParams): Promise<RoxyApiResponse<PaginatedData<BoughtProxyRecord>>> {
    return this.client.get('/proxy/bought_list', params)
  }
}

export class RoxyAccountAPI {
  constructor(private readonly client: RoxyOpenAPI) {}

  list(params: AccountListParams): Promise<RoxyApiResponse<PaginatedData<PlatformAccount>>> {
    return this.client.get('/account/list', params)
  }

  create(params: AccountCreateParams): Promise<RoxyApiResponse<AccountCreateData>> {
    return this.client.post('/account/create', params)
  }

  batchCreate(params: AccountBatchCreateParams): Promise<RoxyApiResponse> {
    return this.client.post('/account/batch_create', params)
  }

  modify(params: AccountModifyParams): Promise<RoxyApiResponse> {
    return this.client.post('/account/modify', params)
  }

  update(params: AccountModifyParams): Promise<RoxyApiResponse> {
    return this.modify(params)
  }

  delete(params: AccountDeleteParams): Promise<RoxyApiResponse> {
    return this.client.post('/account/delete', params)
  }
}
