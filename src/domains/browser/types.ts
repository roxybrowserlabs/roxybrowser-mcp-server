import type {
  RawBrowserProfile,
  RawPlatformAccount,
  RawProject,
  RawProxy,
  RawWorkspace,
} from "../../api/index.js";
import type { PaginationParams } from "../../sdk/shared/pagination.js";

export type Workspace = RawWorkspace;
export type Project = RawProject;
export type BrowserProfile = RawBrowserProfile;
export type BrowserProxy = RawProxy;
export type PlatformAccount = RawPlatformAccount;

export interface ProfileListParams extends PaginationParams {
  dirIds?: string;
  projectIds?: string;
  windowName?: string;
  windowSortNum?: string;
  os?: string;
  [key: string]: unknown;
}

export interface ProfileCreateInput {
  windowName?: string;
  projectId?: number;
  coreType?: string;
  coreVersion?: string;
  os?: string;
  osVersion?: string;
  proxyInfo?: Record<string, unknown>;
  defaultOpenUrl?: string[];
  windowRemark?: string;
  windowPlatformList?: PlatformAccountInput[];
  [key: string]: unknown;
}

export interface ProfileUpdateInput extends Partial<ProfileCreateInput> {}

export interface ProfileOpenOptions {
  forceOpen?: boolean;
  args?: string[];
  headless?: boolean;
}

export interface ProfileDeleteOptions {
  isSoftDelete?: boolean;
}

export interface ProxyListParams extends PaginationParams {
  type?: string;
  proxyType?: string;
  proxyBindStatus?: string;
  proxyAutoRenew?: string;
  country?: string;
  check_status?: number;
  orderName?: string;
  orderType?: "asc" | "desc";
  [key: string]: unknown;
}

export interface ProxyInput {
  protocol: string;
  host: string;
  port: string;
  ipType?: string;
  checkChannel?: string;
  proxyUserName?: string;
  proxyPassword?: string;
  refreshUrl?: string;
  remark?: string;
  [key: string]: unknown;
}

export interface PlatformAccountInput {
  platformUrl: string;
  platformUserName?: string;
  platformPassword?: string;
  platformEfa?: string;
  platformRemarks?: string;
  [key: string]: unknown;
}
