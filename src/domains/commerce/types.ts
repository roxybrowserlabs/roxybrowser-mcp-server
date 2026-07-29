import type {
  BrowserProfile,
  ProfileCreateInput,
  ProfileDeleteOptions,
  ProfileListParams,
  ProfileOpenOptions,
} from "../browser/index.js";

export type CommerceAccountListParams = ProfileListParams;
export type CommerceAccountInput = ProfileCreateInput;
export type CommerceAccount = BrowserProfile;

export type CommerceAccountOpenOptions = ProfileOpenOptions;
export type CommerceAccountDeleteOptions = ProfileDeleteOptions;
