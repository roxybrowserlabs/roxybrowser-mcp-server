import type {
  ProfileConnectionInfo,
  ProxyDetectChannel,
  RawLabel,
  RawProject,
} from "../../../api/index.js";
import type {
  BrowserProfile,
  BrowserProxy,
  PlatformAccount,
  Project,
  Workspace,
} from "../../../domains/browser/index.js";
import type { Page } from "../../../sdk/shared/pagination.js";
import { isVersionAtLeast, ROXY_BROWSER_VERSION_4_0_4 } from "../../../version.js";
import { formatJsonDetail, markdownTable, pagedTable, truncateText } from "../formatting.js";

function combined(name?: string, version?: string): string {
  return [name, version].filter(Boolean).join(" ");
}

function profileSerial(profile: BrowserProfile): string | undefined {
  if (profile.windowSortNum === undefined) return undefined;

  const serialNumber = String(profile.windowSortNum);
  const workspacePrefix = String(profile.workspaceName).slice(0, 3).toLocaleUpperCase();
  return `${workspacePrefix}-${serialNumber}`;
}

function stringField(value: Record<string, unknown>, name: string): string | undefined {
  return typeof value[name] === "string" ? value[name] : undefined;
}

export function formatProfiles(page: Page<BrowserProfile>, roxyBrowserVersion?: string): string {
  const showProject = Boolean(
    roxyBrowserVersion && isVersionAtLeast(roxyBrowserVersion, ROXY_BROWSER_VERSION_4_0_4),
  );
  const headers = showProject
    ? ["Name", "DirId", "SerialNumber", "Project", "Core", "OS", "Remark"]
    : ["Name", "DirId", "SerialNumber", "Core", "OS", "Remark"];
  const rows = page.rows.map((profile) => {
    const base = [
      profile.windowName,
      profile.dirId,
      profileSerial(profile),
      combined(stringField(profile, "coreType"), profile.coreVersion),
      combined(profile.os, profile.osVersion),
      truncateText(profile.windowRemark),
    ];
    return showProject
      ? [
          base[0],
          base[1],
          base[2],
          profile.projectName ||
            (profile.projectId !== undefined ? String(profile.projectId) : undefined),
          ...base.slice(3),
        ]
      : base;
  });
  return pagedTable("Profiles", page, headers, rows, "No profiles found.");
}

export function formatProfile(profile: BrowserProfile): string {
  return formatJsonDetail(profile);
}

export function formatPlatformAccounts(
  page: Page<PlatformAccount>,
  kind: "accounts" | "credentials" = "accounts",
): string {
  const label = kind === "credentials" ? "Platform credentials" : "Platform accounts";
  return pagedTable(
    label,
    page,
    ["ID", "Username", "Platform URL", "Note"],
    page.rows.map((account) => [
      account.id,
      account.platformUserName,
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
          const compatibleProject = project as RawProject;
          const id =
            compatibleProject.projectId ?? compatibleProject.project_id ?? compatibleProject.id;
          const name =
            compatibleProject.projectName ??
            compatibleProject.name ??
            compatibleProject.project_name;
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
      const id = project.projectId ?? project.project_id ?? project.id;
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

export function formatProxies(page: Page<BrowserProxy>): string {
  return pagedTable(
    "Proxies",
    page,
    [
      "ID",
      "Proxy",
      "Country",
      "ExpireDate",
      "Source",
      "Status",
      "BoundProfileSerialNumbers",
      "Note",
    ],
    page.rows.map((proxy) => {
      const address = proxy.host
        ? `${proxy.protocol ? `${proxy.protocol} ` : ""}${proxy.host}${proxy.port ? `:${proxy.port}` : ""}`
        : proxy.protocol;
      return [
        proxy.id,
        address,
        proxy.lastCountry,
        proxy.expireDate,
        proxySource(proxy.dataType),
        proxyStatus(proxy.checkStatus),
        Array.isArray(proxy.bindList) && proxy.bindList.length > 0
          ? proxy.bindList.join(", ")
          : undefined,
        truncateText(proxy.remark),
      ];
    }),
    "No proxies found.",
  );
}

export function formatProxy(proxy: BrowserProxy): string {
  return formatJsonDetail(proxy);
}

export function formatConnections(connections: ProfileConnectionInfo[]): string {
  const available = connections.filter(
    (connection) => connection.dirId || connection.windowName || connection.ws || connection.http,
  );
  if (available.length === 0) {
    return "No opened browsers found.\n\nUse `roxy_profile_open` to open a browser profile first.";
  }

  const details = available.map((connection) => {
    const compatibleConnection = connection as ProfileConnectionInfo & {
      marionette_port?: string | number;
    };
    const isFirefox = Boolean(compatibleConnection.marionette_port);
    return [
      `**${connection.windowName || "Unnamed"}** (${connection.dirId})`,
      connection.ws ? `- ${isFirefox ? "BiDi" : "CDP"} WebSocket: \`${connection.ws}\`` : undefined,
      !isFirefox && connection.http ? `- HTTP Endpoint: \`${connection.http}\`` : undefined,
      `- Core Type: ${isFirefox ? "Firefox" : "Chrome"}`,
    ]
      .filter(Boolean)
      .join("\n");
  });

  return `Found ${available.length} opened browser(s):\n\n${details.join("\n\n")}`;
}

export function formatDetectChannels(channels: ProxyDetectChannel[]): string {
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
