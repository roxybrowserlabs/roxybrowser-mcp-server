import type { RawBrowserConnection, RawLabel } from "../../../api/index.js";
import type {
  BrowserProfile,
  BrowserProxy,
  PlatformAccount,
  Project,
  Workspace,
} from "../../../domains/browser/index.js";
import type { Page } from "../../../sdk/shared/pagination.js";
import { markdownTable, pagedTable, truncateText } from "../formatting.js";

type DetectChannel = { label?: string; type?: string; value?: string };

function joinParts(parts: Array<string | undefined>): string {
  return parts.filter((part): part is string => Boolean(part)).join(" | ");
}

function combined(name?: string, version?: string): string {
  return [name, version].filter(Boolean).join(" ");
}

function versioned(label: string, name?: string, version?: string): string | undefined {
  const value = combined(name, version);
  return value ? `${label}: ${value}` : undefined;
}

function projectLabel(profile: BrowserProfile): string | undefined {
  if (profile.projectName && profile.projectId !== undefined) {
    return `project: ${profile.projectName} (${profile.projectId})`;
  }
  if (profile.projectName) return `project: ${profile.projectName}`;
  if (profile.projectId !== undefined) return `projectId: ${profile.projectId}`;
  return undefined;
}

function profileSerial(profile: BrowserProfile): string | undefined {
  if (!profile.workspaceName || profile.windowSortNum === undefined) return undefined;
  return `${profile.workspaceName.slice(0, 3).toLocaleUpperCase()}-${profile.windowSortNum}`;
}

function profileLine(profile: BrowserProfile, detailed = false): string {
  const serial = profileSerial(profile);
  return joinParts([
    `- ${profile.windowName || "-"}`,
    `dirId: ${profile.dirId}`,
    serial ? `serial: ${serial}` : undefined,
    versioned("core", profile.coreType, profile.coreVersion),
    versioned("os", profile.os, profile.osVersion),
    projectLabel(profile),
    typeof profile.openStatus === "boolean"
      ? `status: ${profile.openStatus ? "open" : "closed"}`
      : undefined,
    detailed && profile.workspaceName ? `workspace: ${profile.workspaceName}` : undefined,
    detailed && profile.windowRemark ? `note: ${truncateText(profile.windowRemark)}` : undefined,
  ]);
}

export function formatProfiles(page: Page<BrowserProfile>): string {
  return pagedTable(
    "Profiles",
    page,
    ["Name", "DirId", "Serial", "Core", "OS", "Remark"],
    page.rows.map((profile) => [
      profile.windowName,
      profile.dirId,
      profileSerial(profile),
      combined(profile.coreType, profile.coreVersion),
      combined(profile.os, profile.osVersion),
      truncateText(profile.windowRemark),
    ]),
    "No profiles found.",
  );
}

export function formatProfile(profile: BrowserProfile): string {
  return `Profile\n${profileLine(profile, true)}`;
}

export function formatPlatformAccounts(
  page: Page<PlatformAccount>,
  kind: "accounts" | "credentials" = "accounts",
): string {
  const label = kind === "credentials" ? "Platform credentials" : "Platform accounts";
  return pagedTable(
    label,
    page,
    ["ID", "Username", "Platform", "URL", "Note"],
    page.rows.map((account) => [
      account.id,
      account.platformUserName,
      account.platformName,
      account.platformUrl,
      truncateText(account.platformRemarks),
    ]),
    `No ${label.toLowerCase()} found.`,
  );
}

export function formatWorkspaces(page: Page<Workspace>): string {
  return pagedTable(
    "Workspaces",
    page,
    ["ID", "Workspace", "Projects"],
    page.rows.map((workspace) => {
      const projects = workspace.project_details
        ?.map((project) => {
          const id = project.projectId ?? project.id;
          const name = project.projectName ?? project.name ?? project.project_name;
          return name && id !== undefined ? `${name} (${id})` : name || String(id ?? "");
        })
        .filter(Boolean)
        .join(", ");
      return [workspace.id, workspace.workspaceName, projects];
    }),
    "No workspaces found.",
  );
}

export function formatProjects(page: Page<Project>): string {
  return pagedTable(
    "Projects",
    page,
    ["ID", "Project"],
    page.rows.map((project) => {
      const id = project.projectId ?? project.id;
      const name = project.projectName ?? project.name ?? project.project_name;
      return [id, name];
    }),
    "No projects found.",
  );
}

export function formatLabels(labels: RawLabel[]): string {
  if (labels.length === 0) return "No labels found.";
  return `Labels: ${labels.length}\n${markdownTable(
    ["ID", "Label", "Color"],
    labels.map((label) => [label.id, label.name, label.color]),
  )}`;
}

function proxySource(dataType?: string): string | undefined {
  if (dataType === "buyProxy") return "store";
  if (dataType === "proxyModule") return "user";
  return dataType;
}

function proxyStatus(checkStatus?: number | string): string | undefined {
  if (checkStatus === 1) return "passed";
  if (checkStatus === 2) return "failed";
  if (checkStatus === 0) return "unknown";
  if (checkStatus === "passed" || checkStatus === "failed" || checkStatus === "unknown") {
    return checkStatus;
  }
  return undefined;
}

function proxyLine(proxy: BrowserProxy, detailed = false): string {
  const source = proxySource(proxy.dataType);
  const status = proxyStatus(proxy.checkStatus);
  const address = proxy.host
    ? `${proxy.protocol ? `${proxy.protocol} ` : ""}${proxy.host}${proxy.port ? `:${proxy.port}` : ""}`
    : proxy.protocol;
  return joinParts([
    `- ${proxy.id}`,
    address,
    source ? `source: ${source}` : undefined,
    status ? `status: ${status}` : undefined,
    proxy.bindCount !== undefined ? `binds: ${proxy.bindCount}` : undefined,
    detailed && proxy.proxyUserName ? `username: ${proxy.proxyUserName}` : undefined,
    detailed && proxy.checkChannelValue ? `check: ${proxy.checkChannelValue}` : undefined,
    detailed && proxy.lastCountry ? `location: ${proxy.lastCountry}` : undefined,
    proxy.remark ? `note: ${truncateText(proxy.remark)}` : undefined,
  ]);
}

export function formatProxies(page: Page<BrowserProxy>): string {
  return pagedTable(
    "Proxies",
    page,
    ["ID", "Proxy", "Source", "Status", "Binds", "Note"],
    page.rows.map((proxy) => {
      const address = proxy.host
        ? `${proxy.protocol ? `${proxy.protocol} ` : ""}${proxy.host}${proxy.port ? `:${proxy.port}` : ""}`
        : proxy.protocol;
      return [
        proxy.id,
        address,
        proxySource(proxy.dataType),
        proxyStatus(proxy.checkStatus),
        proxy.bindCount,
        truncateText(proxy.remark),
      ];
    }),
    "No proxies found.",
  );
}

export function formatProxy(proxy: BrowserProxy): string {
  return `Proxy\n${proxyLine(proxy, true)}`;
}

export function formatConnections(connections: RawBrowserConnection[]): string {
  const available = connections.filter(
    (connection) => connection.dirId || connection.windowName || connection.ws || connection.http,
  );
  if (available.length === 0) return "No connection info found.";
  return `Connections: ${available.length}\n${markdownTable(
    ["Name", "dirId", "WebSocket", "HTTP", "PID"],
    available.map((connection) => [
      connection.windowName,
      connection.dirId,
      connection.ws,
      connection.http,
      connection.pid,
    ]),
  )}`;
}

export function formatDetectChannels(channels: DetectChannel[]): string {
  if (channels.length === 0) return "No detect channels found.";
  return `Detect channels: ${channels.length}\n${markdownTable(
    ["Label", "Value", "Type"],
    channels.map((channel) => [
      channel.label,
      channel.value && channel.value !== channel.label ? channel.value : undefined,
      channel.type,
    ]),
  )}`;
}
