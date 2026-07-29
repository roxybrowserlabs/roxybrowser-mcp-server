import type { PaginationParams } from "../../sdk/shared/pagination.js";
import type { ProfileDeleteOptions, ProfileOpenOptions } from "../browser/index.js";

export interface CommerceAccountListParams extends PaginationParams {
  keyword?: string;
  projectIds?: number[];
}

export interface CommerceAccountInput {
  name: string;
  projectId?: number;
  proxyId?: number;
  platform?: {
    url: string;
    username?: string;
    password?: string;
    twoFactorKey?: string;
    remarks?: string;
  };
  urls?: string[];
  raw?: Record<string, unknown>;
}

export interface CommerceAccount {
  id: string;
  name?: string;
  projectId?: number;
  raw: Record<string, unknown>;
}

export type CommerceAccountOpenOptions = ProfileOpenOptions;
export type CommerceAccountDeleteOptions = ProfileDeleteOptions;
