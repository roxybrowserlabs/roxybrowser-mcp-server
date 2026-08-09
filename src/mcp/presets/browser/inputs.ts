import type {
  PlatformAccountInput,
  ProfileCreateInput,
  ProfileDeleteOptions,
  ProfileListParams,
  ProfileOpenOptions,
  ProfileUpdateInput,
  ProxyInput,
  ProxyListParams,
} from "../../../domains/browser/index.js";
import type {
  BrowserCoreType,
  BrowserOperatingSystem,
  BrowserOsVersion,
  PlatformCookie,
} from "../../../api/index.js";
import { removeUndefined } from "../../../sdk/shared/normalize.js";
import { normalizeCookies, validateCookieInput } from "./cookies.js";

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
  const serialNumber = normalizeProfileSerialNumber(args.serialNumber);
  return removeUndefined({
    page: args.page,
    pageSize: args.pageSize,
    dirIds: args.dirIds?.join(","),
    projectIds: args.projectIds?.join(","),
    windowName: args.name,
    sortNums: serialNumber,
    os: args.os,
  });
}

function normalizeProfileSerialNumber(value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined;

  const serialNumber = String(value).trim();
  if (!serialNumber) return undefined;

  const match = serialNumber.match(/^(?:[A-Za-z]+-)?(\d+)$/);
  return match?.[1] ?? serialNumber;
}

export interface NormalizedProfileInput {
  input: ProfileCreateInput;
  warnings: string[];
}

export interface NormalizedProfileUpdateInput {
  input: ProfileUpdateInput;
  warnings: string[];
}

export function normalizeProfileInput(args: Record<string, any>): ProfileCreateInput {
  return normalizeProfileInputWithWarnings(args).input;
}

export function normalizeProfileInputWithWarnings(
  args: Record<string, any>,
): NormalizedProfileInput {
  const normalizedBrowserCore =
    typeof args.browserCore === "string" ? args.browserCore.trim() : undefined;
  const [browserCoreType, browserCoreVersion] =
    normalizedBrowserCore && normalizedBrowserCore !== "ALL"
      ? normalizedBrowserCore.split(/\s+/, 2)
      : [];
  const hasBrowserCore = Boolean(browserCoreType);
  const useLatestCore =
    browserCoreVersion?.toLowerCase() === "latest" || browserCoreVersion?.toLowerCase() === "auto";
  const [osName, osVersion] = typeof args.os === "string" ? args.os.trim().split(/\s+/, 2) : [];
  const normalizedOsName =
    osName?.toLowerCase() === "window" || osName?.toLowerCase() === "windows"
      ? "Windows"
      : osName?.toLowerCase() === "macos"
        ? "macOS"
        : osName?.toLowerCase() === "linux"
          ? "Linux"
          : osName?.toLowerCase() === "android"
            ? "Android"
            : osName?.toLowerCase() === "ios"
              ? "IOS"
              : osName;
  const normalizedCookie = normalizeProfileCookieInput(args.cookie, args.platformAccounts);
  return {
    input: removeUndefined({
      windowName: args.name,
      projectId: args.projectId,
      coreType: (browserCoreType ?? args.core?.type) as BrowserCoreType | undefined,
      coreVersion: useLatestCore ? undefined : (browserCoreVersion ?? args.core?.version),
      useLatestCore: hasBrowserCore ? (useLatestCore ? 1 : 0) : undefined,
      os: (normalizedOsName ?? args.os?.name) as BrowserOperatingSystem | undefined,
      osVersion: (osVersion ?? args.os?.version) as BrowserOsVersion | undefined,
      cookie: normalizedCookie.cookie,
      searchEngine: args.searchEngine,
      labelIds: args.labelIds,
      proxyInfo: normalizeProfileProxyInput(args.proxyInfo, args.proxyId),
      defaultOpenUrl: args.urls,
      windowRemark: args.remark,
      windowPlatformList: args.platformAccounts?.map(normalizeProfilePlatformAccountInput),
      fingerInfo: args.fingerInfo,
    }),
    warnings: normalizedCookie.warning ? [normalizedCookie.warning] : [],
  };
}

export function normalizeProfileUpdateInputWithWarnings(
  args: Record<string, any>,
): NormalizedProfileUpdateInput {
  const normalized = normalizeProfileInputWithWarnings({
    ...args,
    browserCore: undefined,
  });
  const coreVersion = typeof args.coreVersion === "string" ? args.coreVersion.trim() : undefined;
  const useLatestCore = coreVersion?.toLowerCase() === "latest";
  const { coreType: _coreType, ...input } = normalized.input;

  return {
    input: removeUndefined({
      ...input,
      coreVersion: useLatestCore ? undefined : coreVersion,
      useLatestCore: coreVersion === undefined ? undefined : useLatestCore ? 1 : 0,
    }),
    warnings: normalized.warnings,
  };
}

function normalizeProfileCookieInput(
  cookie: unknown,
  platformAccounts: Array<Record<string, any>> | undefined,
): { cookie?: PlatformCookie[]; warning?: string } {
  if (cookie === undefined || cookie === null) return {};
  if (Array.isArray(cookie)) return { cookie: normalizeCookies(cookie) };
  if (typeof cookie === "object") return { cookie: normalizeCookies([cookie]) };
  if (typeof cookie !== "string") {
    return { warning: "Cookie was omitted because its input type is unsupported." };
  }

  const platformUrls = (platformAccounts ?? [])
    .map((account) => account.platformUrl)
    .filter((url): url is string => typeof url === "string" && url.trim().length > 0);
  const result = validateCookieInput(cookie, { platformUrls });
  return result.valid
    ? { cookie: result.cookies }
    : { warning: `Cookie was omitted because parsing failed: ${result.message}` };
}

function normalizeProfileProxyInput(
  proxyInfo: Record<string, any> | undefined,
  legacyProxyId: number | undefined,
) {
  const id = proxyInfo?.id ?? legacyProxyId;
  if (id !== undefined) {
    return { moduleId: id, proxyMethod: "choose" as const };
  }
  if (proxyInfo === undefined) return undefined;
  return removeUndefined({
    moduleId: proxyInfo.moduleId,
    proxyMethod: proxyInfo.proxyMethod,
    proxyCategory: proxyInfo.proxyCategory,
    ipType: proxyInfo.ipType,
    host: proxyInfo.host,
    port: proxyInfo.port,
    proxyUserName: proxyInfo.proxyUserName ?? proxyInfo.username,
    proxyPassword: proxyInfo.proxyPassword ?? proxyInfo.password,
    refreshUrl: proxyInfo.refreshUrl,
    checkChannel: proxyInfo.checkChannel,
  });
}

function normalizeProfilePlatformAccountInput(args: Record<string, any>) {
  return removeUndefined({
    id: args.id,
    platformUrl: args.platformUrl,
    platformUserName: args.platformUserName ?? args.username,
    platformPassword: args.platformPassword ?? args.password,
    platformEfa: args.platformEfa ?? args.twoFactorKey,
    platformRemarks: args.platformRemarks ?? args.remarks,
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
