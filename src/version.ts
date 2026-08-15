import packageJson from "../package.json" with { type: "json" };
import { compareVersions, validate } from "compare-versions";
import { ROXY_BROWSER_VERSION_4_0_4 } from "./roxy-browser-versions.js";

export const ROXY_OPENAPI_VERSION = packageJson.version;
export { ROXY_BROWSER_VERSION_3_0_0, ROXY_BROWSER_VERSION_4_0_4 } from "./roxy-browser-versions.js";

export interface RoxyCapability {
  operationId: string;
  sinceRoxyBrowserVersion?: string;
  endpoint?: string;
}

export const ROXY_CAPABILITIES = {
  "browser.workspace.list": {
    operationId: "browser.workspace.list",
    endpoint: "GET /browser/workspace",
  },
  "browser.project.list": {
    operationId: "browser.project.list",
    endpoint: "GET /project/list",
  },
  "browser.label.list": {
    operationId: "browser.label.list",
    endpoint: "GET /browser/label",
  },
  "browser.profile.list": {
    operationId: "browser.profile.list",
    endpoint: "GET /browser/list_v3",
  },
  "browser.profile.get": {
    operationId: "browser.profile.get",
    endpoint: "GET /browser/detail",
  },
  "browser.profile.create": {
    operationId: "browser.profile.create",
    endpoint: "POST /browser/create",
  },
  "browser.profile.update": {
    operationId: "browser.profile.update",
    endpoint: "POST /browser/mdf",
  },
  "browser.profile.open": {
    operationId: "browser.profile.open",
    endpoint: "POST /browser/open",
  },
  "browser.profile.openMany": {
    operationId: "browser.profile.openMany",
    endpoint: "POST /browser/agent/open",
    sinceRoxyBrowserVersion: ROXY_BROWSER_VERSION_4_0_4,
  },
  "browser.profile.close": {
    operationId: "browser.profile.close",
    endpoint: "POST /browser/close",
  },
  "browser.profile.delete": {
    operationId: "browser.profile.delete",
    endpoint: "POST /browser/delete",
  },
  "browser.profile.connectionInfo": {
    operationId: "browser.profile.connectionInfo",
    endpoint: "GET /browser/connection_info",
  },
  "browser.profile.randomizeFingerprint": {
    operationId: "browser.profile.randomizeFingerprint",
    endpoint: "POST /browser/random_env",
  },
  "browser.profile.clearLocalCache": {
    operationId: "browser.profile.clearLocalCache",
    endpoint: "POST /browser/clear_local_cache",
  },
  "browser.profile.clearServerCache": {
    operationId: "browser.profile.clearServerCache",
    endpoint: "POST /browser/clear_server_cache",
  },
  "browser.proxy.list": {
    operationId: "browser.proxy.list",
    endpoint: "GET /proxy/list_merged",
  },
  "browser.proxy.get": {
    operationId: "browser.proxy.get",
    endpoint: "GET /proxy/detail",
  },
  "browser.proxy.create": {
    operationId: "browser.proxy.create",
    endpoint: "POST /proxy/create | POST /proxy/batch_create",
  },
  "browser.proxy.update": {
    operationId: "browser.proxy.update",
    endpoint: "POST /proxy/modify",
  },
  "browser.proxy.delete": {
    operationId: "browser.proxy.delete",
    endpoint: "POST /proxy/delete",
  },
  "browser.proxy.detect": {
    operationId: "browser.proxy.detect",
    endpoint: "POST /proxy/detect",
  },
  "browser.proxy.detectChannels": {
    operationId: "browser.proxy.detectChannels",
    endpoint: "GET /proxy/detect_channel",
  },
  "browser.platformAccount.list": {
    operationId: "browser.platformAccount.list",
    endpoint: "GET /account/list",
  },
  "browser.platformAccount.create": {
    operationId: "browser.platformAccount.create",
    endpoint: "POST /account/create | POST /account/batch_create",
  },
  "browser.platformAccount.update": {
    operationId: "browser.platformAccount.update",
    endpoint: "POST /account/modify",
  },
  "browser.platformAccount.delete": {
    operationId: "browser.platformAccount.delete",
    endpoint: "POST /account/delete",
  },
} as const satisfies Record<string, RoxyCapability>;

export type RoxyOperationId = keyof typeof ROXY_CAPABILITIES;

export function getRoxyCapability(operationId: string): RoxyCapability | undefined {
  return ROXY_CAPABILITIES[operationId as RoxyOperationId];
}

export function isRoxyCapabilitySupported(
  operationId: string,
  roxyBrowserVersion?: string,
): boolean {
  const capability = getRoxyCapability(operationId);
  if (!capability) return false;
  if (!capability.sinceRoxyBrowserVersion) return true;
  return Boolean(
    roxyBrowserVersion && isVersionAtLeast(roxyBrowserVersion, capability.sinceRoxyBrowserVersion),
  );
}

export function isVersionAtLeast(actual: string, minimum: string): boolean {
  return validate(actual) && validate(minimum) && compareVersions(actual, minimum) >= 0;
}
