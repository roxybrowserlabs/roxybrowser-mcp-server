import type {
  PlatformAccountInput,
  ProfileCreateInput,
  ProfileDeleteOptions,
  ProfileListParams,
  ProfileOpenOptions,
  ProxyInput,
  ProxyListParams,
} from "../../../domains/browser/index.js";
import { removeUndefined } from "../../../sdk/shared/normalize.js";

export function normalizeProxyListArgs(args: Record<string, any>): ProxyListParams {
  return removeUndefined({
    page: args.page,
    pageSize: args.pageSize,
    proxyType: args.source === "user" ? "0" : args.source === "store" ? "1" : undefined,
    type: args.type === "available" ? "available_list" : undefined,
    proxyBindStatus:
      args.bindStatus === "bound" ? "1" : args.bindStatus === "unbound" ? "0" : undefined,
    proxyAutoRenew: args.autoRenew === undefined ? undefined : args.autoRenew ? "1" : "0",
    country: args.country,
    check_status:
      args.checkStatus === "passed"
        ? 1
        : args.checkStatus === "failed"
          ? 2
          : args.checkStatus === "unknown"
            ? 0
            : undefined,
    orderName: args.sortBy,
    orderType: args.sortOrder,
  });
}

export function normalizeProfileListArgs(args: Record<string, any>): ProfileListParams {
  return removeUndefined({
    page: args.page,
    pageSize: args.pageSize,
    dirIds: args.dirIds?.join(","),
    projectIds: args.projectIds?.join(","),
    windowName: args.name,
    windowSortNum: args.serialNumber,
    os: args.os,
  });
}

export function normalizeProfileInput(args: Record<string, any>): ProfileCreateInput {
  return removeUndefined({
    windowName: args.name,
    projectId: args.projectId,
    coreType: args.core?.type,
    coreVersion: args.core?.version,
    os: args.os?.name,
    osVersion: args.os?.version,
    proxyInfo:
      args.proxyId === undefined ? undefined : { moduleId: args.proxyId, proxyMethod: "choose" },
    defaultOpenUrl: args.urls,
    windowRemark: args.remark,
    windowPlatformList: args.platformAccounts?.map(normalizePlatformAccountInput),
  });
}

export function normalizeProfileOpenOptions(args: Record<string, any>): ProfileOpenOptions {
  return removeUndefined({
    forceOpen: args.force,
    args: args.args,
    headless: args.headless,
  });
}

export function normalizeProfileDeleteOptions(args: Record<string, any>): ProfileDeleteOptions {
  return removeUndefined({ isSoftDelete: args.soft });
}

export function normalizeProxyInput(args: Record<string, any>): ProxyInput {
  return removeUndefined({
    protocol: args.protocol,
    host: args.host,
    port: args.port,
    ipType: args.ipType ?? "IPV4",
    checkChannel: args.checkChannel,
    proxyUserName: args.username,
    proxyPassword: args.password,
    refreshUrl: args.refreshUrl,
    remark: args.remark,
  }) as ProxyInput;
}

export function normalizePlatformAccountInput(args: Record<string, any>): PlatformAccountInput {
  return removeUndefined({
    platformUrl: args.platformUrl,
    platformUserName: args.username,
    platformPassword: args.password,
    platformEfa: args.twoFactorKey,
    platformRemarks: args.remarks,
  }) as PlatformAccountInput;
}
