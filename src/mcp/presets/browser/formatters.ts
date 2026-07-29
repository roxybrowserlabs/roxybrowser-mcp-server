import type { BrowserProfile, PlatformAccount } from "../../../domains/browser/index.js";
import type { Page } from "../../../sdk/shared/pagination.js";

export function formatProfiles(page: Page<BrowserProfile>): string {
  if (page.rows.length === 0) return "No profiles found.";

  return [
    `Found ${page.total} profile(s).`,
    "",
    ...page.rows.map((profile) =>
      [
        `windowName: ${profile.windowName ?? "Unnamed"}`,
        `  - dirId: ${profile.dirId}`,
        `  - coreType: ${profile.coreType ?? "Unknown"}`,
        `  - coreVersion: ${profile.coreVersion ?? "N/A"}`,
        `  - os: ${profile.os ?? "Unknown"}`,
        `  - osVersion: ${profile.osVersion ?? "N/A"}`,
      ].join("\n"),
    ),
  ].join("\n");
}

export function formatProfile(profile: BrowserProfile): string {
  return [
    `windowName: ${profile.windowName ?? "Unnamed"}`,
    `dirId: ${profile.dirId}`,
    `coreType: ${profile.coreType ?? "Unknown"}`,
    `coreVersion: ${profile.coreVersion ?? "N/A"}`,
    `os: ${profile.os ?? "Unknown"}`,
    `osVersion: ${profile.osVersion ?? "N/A"}`,
  ].join("\n");
}

export function formatPlatformAccounts(page: Page<PlatformAccount>): string {
  if (page.rows.length === 0) return "No platform accounts found.";

  return [
    `Found ${page.total} platform account(s).`,
    "",
    ...page.rows.map((account) =>
      [
        `Platform account: ${account.platformUrl ?? "Unknown platform"}`,
        `  - id: ${account.id}`,
        `  - platformUserName: ${account.platformUserName ?? "N/A"}`,
        `  - platformRemarks: ${account.platformRemarks ?? "N/A"}`,
      ].join("\n"),
    ),
  ].join("\n");
}
