import type {
  ProfileCreateInput,
  ProfileDeleteOptions,
  ProfileListParams,
  ProfileOpenData,
  ProfileOpenOptions,
  ProfileOpenResult,
  ProfileUpdateInput,
  PlatformAccountInput,
  PlatformAccountUpdateInput,
  ProxyBatchCreateInput,
  ProxyBatchItem,
  ProxyInput,
  ProxyListParams,
  ProxyUpdateInput,
  RawBrowserProfileDetail,
  RawPlatformAccount,
  RawProject,
  RawProxy,
  RawWorkspace,
} from "../../api/index.js";

export type Workspace = RawWorkspace;
export type Project = RawProject;
export type BrowserProfile = RawBrowserProfileDetail;
export type BrowserProxy = RawProxy;
export type PlatformAccount = RawPlatformAccount;

export type {
  ProfileCreateInput,
  ProfileDeleteOptions,
  ProfileListParams,
  ProfileOpenData,
  ProfileOpenOptions,
  ProfileOpenResult,
  ProfileUpdateInput,
  PlatformAccountInput,
  PlatformAccountUpdateInput,
  ProxyBatchCreateInput,
  ProxyBatchItem,
  ProxyInput,
  ProxyListParams,
  ProxyUpdateInput,
};
