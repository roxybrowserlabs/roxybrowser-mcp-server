import type { RawBrowserConnection, RawLabel } from "../../../api/index.js";
import type {
  BrowserProfile,
  BrowserProxy,
  PlatformAccount,
  Project,
  Workspace,
} from "../../../domains/browser/index.js";
import type { Page } from "../../../sdk/shared/pagination.js";

type DetectChannel = { label?: string; type?: string; value?: string };

function joinParts(parts: Array<string | undefined>): string {
  return parts.filter((part): part is string => Boolean(part)).join(" | ");
}

function versioned(label: string, name?: string, version?: string): string | undefined {
  const value = [name, version].filter(Boolean).join(" ");
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

function profileLine(profile: BrowserProfile, detailed = false): string {
  return joinParts([
    `- ${profile.windowName || "Unnamed"}`,
    `dirId: ${profile.dirId}`,
    profile.windowSortNum !== undefined ? `serial: ${profile.windowSortNum}` : undefined,
    versioned("core", profile.coreType, profile.coreVersion),
    versioned("os", profile.os, profile.osVersion),
    projectLabel(profile),
    typeof profile.openStatus === "boolean"
      ? `status: ${profile.openStatus ? "open" : "closed"}`
      : undefined,
    detailed && profile.workspaceName ? `workspace: ${profile.workspaceName}` : undefined,
    detailed && profile.windowRemark ? `note: ${profile.windowRemark}` : undefined,
  ]);
}

export function formatProfiles(page: Page<BrowserProfile>): string {
  if (page.rows.length === 0) return "No profiles found.";
  return [`Profiles: ${page.total}`, ...page.rows.map((profile) => profileLine(profile))].join(
    "\n",
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
  if (page.rows.length === 0) return `No ${label.toLowerCase()} found.`;
  return [
    `${label}: ${page.total}`,
    ...page.rows.map((account) => {
      const title =
        account.platformUserName ||
        account.platformName ||
        account.platformUrl ||
        String(account.id);
      return joinParts([
        `- ${title}`,
        `id: ${account.id}`,
        account.platformName && account.platformName !== title
          ? `platform: ${account.platformName}`
          : undefined,
        account.platformUrl && account.platformUrl !== title
          ? `url: ${account.platformUrl}`
          : undefined,
        account.platformRemarks ? `note: ${account.platformRemarks}` : undefined,
      ]);
    }),
  ].join("\n");
}

export function formatWorkspaces(page: Page<Workspace>): string {
  if (page.rows.length === 0) return "No workspaces found.";
  return [
    `Workspaces: ${page.total}`,
    ...page.rows.map((workspace) => {
      const projects = workspace.project_details
        ?.map((project) => {
          const id = project.projectId ?? project.id;
          const name = project.projectName ?? project.name ?? project.project_name;
          return name && id !== undefined ? `${name} (${id})` : name || String(id ?? "");
        })
        .filter(Boolean)
        .join(", ");
      return joinParts([
        `- ${workspace.workspaceName}`,
        `id: ${workspace.id}`,
        projects ? `projects: ${projects}` : undefined,
      ]);
    }),
  ].join("\n");
}

export function formatProjects(page: Page<Project>): string {
  if (page.rows.length === 0) return "No projects found.";
  return [
    `Projects: ${page.total}`,
    ...page.rows.map((project) => {
      const id = project.projectId ?? project.id;
      const name = project.projectName ?? project.name ?? project.project_name ?? "Unnamed";
      return joinParts([`- ${name}`, id !== undefined ? `id: ${id}` : undefined]);
    }),
  ].join("\n");
}

export function formatLabels(labels: RawLabel[]): string {
  if (labels.length === 0) return "No labels found.";
  return [
    `Labels: ${labels.length}`,
    ...labels.map((label) => joinParts([`- ${label.name}`, `id: ${label.id}`, label.color])),
  ].join("\n");
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
    proxy.remark ? `note: ${proxy.remark}` : undefined,
  ]);
}

export function formatProxies(page: Page<BrowserProxy>): string {
  if (page.rows.length === 0) return "No proxies found.";
  return [`Proxies: ${page.total}`, ...page.rows.map((proxy) => proxyLine(proxy))].join("\n");
}

export function formatProxy(proxy: BrowserProxy): string {
  return `Proxy\n${proxyLine(proxy, true)}`;
}

export function formatConnections(connections: RawBrowserConnection[]): string {
  const available = connections.filter(
    (connection) => connection.dirId || connection.windowName || connection.ws || connection.http,
  );
  if (available.length === 0) return "No connection info found.";
  return [
    `Connections: ${available.length}`,
    ...available.map((connection) =>
      joinParts([
        `- ${connection.windowName || connection.dirId || "Browser"}`,
        connection.dirId ? `dirId: ${connection.dirId}` : undefined,
        connection.ws ? `ws: ${connection.ws}` : undefined,
        connection.http ? `http: ${connection.http}` : undefined,
        connection.pid !== undefined ? `pid: ${connection.pid}` : undefined,
      ]),
    ),
  ].join("\n");
}

export function formatDetectChannels(channels: DetectChannel[]): string {
  if (channels.length === 0) return "No detect channels found.";
  return [
    `Detect channels: ${channels.length}`,
    ...channels.map((channel) =>
      joinParts([
        `- ${channel.label || channel.value || "Unnamed"}`,
        channel.value && channel.value !== channel.label ? channel.value : undefined,
        channel.type ? `type: ${channel.type}` : undefined,
      ]),
    ),
  ].join("\n");
}
