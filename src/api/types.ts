export type JsonObject = Record<string, unknown>;

export interface RoxyApiClientOptions {
  apiKey?: string;
  apikey?: string;
  baseUrl?: string;
  apiHost?: string;
  workspaceId?: number;
  timeout?: number;
  fetch?: typeof fetch;
}

export interface RoxyApiResponse<T = unknown> {
  code: number;
  msg: string;
  data?: T;
}

export interface PageRequest {
  page_index?: number;
  page_size?: number;
}

export interface PageData<T> {
  total: number;
  rows: T[];
}

export interface RawWorkspace {
  id: number;
  workspaceName: string;
  project_details: RawProject[];
}

export interface RawProject {
  id?: number;
  name?: string;
  projectId?: number;
  projectName?: string;
  project_name?: string;
  [key: string]: unknown;
}

export interface RawBrowserProfile {
  dirId: string;
  windowSortNum?: number;
  windowName?: string;
  coreVersion?: string;
  coreType?: string;
  os?: string;
  osVersion?: string;
  windowRemark?: string;
  projectId?: number;
  projectName?: string;
  openStatus?: boolean;
  workspaceName?: string;
  [key: string]: unknown;
}

export interface RawBrowserConnection {
  dirId?: string;
  ws: string;
  http: string;
  coreVersion?: string;
  coreType?: string;
  driver?: string;
  sortNum?: number;
  windowName?: string;
  windowRemark?: string;
  pid?: number;
  [key: string]: unknown;
}

export interface RawProxy {
  id: number;
  dataType?: "proxyModule" | "buyProxy" | (string & {});
  checkStatus?: number;
  checkChannel?: string;
  checkChannelValue?: string;
  proxyCheckChannel?: string;
  ipType?: string;
  protocol?: string;
  host?: string;
  port?: string;
  proxyUserName?: string;
  proxyPassword?: string;
  refreshUrl?: string;
  remark?: string;
  bindCount?: number;
  bindList?: number[];
  bandwidthSpeed?: number;
  [key: string]: unknown;
}

export interface RawPlatformAccount {
  id: number;
  platformUrl?: string;
  platformUserName?: string;
  platformPassword?: string;
  platformEfa?: string;
  platformName?: string;
  platformRemarks?: string;
  platformCookies?: unknown[];
  createTime?: string;
  updateTime?: string;
  [key: string]: unknown;
}

export interface RawLabel {
  id: number;
  name: string;
  color: string;
}
