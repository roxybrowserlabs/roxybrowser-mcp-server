import type { PaginationParams } from "../../sdk/shared/pagination.js";

export interface Workspace {
  id: number;
  name: string;
  projects: Project[];
}

export interface Project {
  id: number;
  name: string;
}

export interface BrowserProfile {
  id: string;
  serialNumber?: number;
  name?: string;
  core?: {
    type?: string;
    version?: string;
  };
  os?: {
    name?: string;
    version?: string;
  };
  remark?: string;
  raw: Record<string, unknown>;
}

export interface ProfileListParams extends PaginationParams {
  projectIds?: number[];
  name?: string;
  serialNumber?: string;
  os?: string;
}

export interface ProfileCreateInput {
  name?: string;
  projectId?: number;
  core?: {
    type?: string;
    version?: string;
  };
  os?: {
    name?: string;
    version?: string;
  };
  proxyId?: number;
  urls?: string[];
  remark?: string;
  platformAccounts?: PlatformAccountInput[];
  raw?: Record<string, unknown>;
}

export interface ProfileUpdateInput extends Partial<ProfileCreateInput> {}

export interface ProfileOpenOptions {
  force?: boolean;
  args?: string[];
  headless?: boolean;
}

export interface ProfileDeleteOptions {
  soft?: boolean;
}

export interface ProxyListParams extends PaginationParams {
  source?: "user" | "store" | "all";
  type?: "available" | "all";
  bindStatus?: "bound" | "unbound" | "all";
  autoRenew?: boolean;
  country?: string;
  checkStatus?: "passed" | "failed" | "unknown";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ProxyInput {
  protocol: string;
  host: string;
  port: string;
  ipType?: string;
  checkChannel?: string;
  username?: string;
  password?: string;
  refreshUrl?: string;
  remark?: string;
}

export interface PlatformAccountInput {
  platformUrl: string;
  username?: string;
  password?: string;
  twoFactorKey?: string;
  remarks?: string;
  raw?: Record<string, unknown>;
}

export interface PlatformAccount {
  id: number;
  platformUrl?: string;
  username?: string;
  remarks?: string;
  raw: Record<string, unknown>;
}
