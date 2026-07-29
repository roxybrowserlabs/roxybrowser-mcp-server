import type { CommerceAccount } from "../../../domains/commerce/index.js";
import type { Page } from "../../../sdk/shared/pagination.js";
import { pagedTable, truncateText } from "../formatting.js";

function projectValue(account: CommerceAccount): string {
  if (account.projectName && account.projectId !== undefined) {
    return `${account.projectName} (${account.projectId})`;
  }
  return account.projectName || (account.projectId !== undefined ? String(account.projectId) : "");
}

function accountLine(account: CommerceAccount, detailed = false): string {
  const parts = [
    `- ${account.windowName || "-"}`,
    `dirId: ${account.dirId}`,
    account.projectName && account.projectId !== undefined
      ? `project: ${account.projectName} (${account.projectId})`
      : account.projectName
        ? `project: ${account.projectName}`
        : account.projectId !== undefined
          ? `projectId: ${account.projectId}`
          : undefined,
    typeof account.openStatus === "boolean"
      ? `status: ${account.openStatus ? "open" : "closed"}`
      : undefined,
    detailed && account.windowRemark ? `note: ${truncateText(account.windowRemark)}` : undefined,
  ];
  return parts.filter(Boolean).join(" | ");
}

export function formatCommerceAccounts(page: Page<CommerceAccount>): string {
  return pagedTable(
    "Accounts",
    page,
    ["Name", "dirId", "Project", "Status"],
    page.rows.map((account) => [
      account.windowName,
      account.dirId,
      projectValue(account),
      typeof account.openStatus === "boolean" ? (account.openStatus ? "open" : "closed") : "",
    ]),
    "No ecommerce accounts found.",
  );
}

export function formatCommerceAccount(account: CommerceAccount): string {
  return `Account\n${accountLine(account, true)}`;
}
