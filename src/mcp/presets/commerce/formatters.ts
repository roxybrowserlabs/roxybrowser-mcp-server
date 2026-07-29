import type { CommerceAccount } from "../../../domains/commerce/index.js";
import type { Page } from "../../../sdk/shared/pagination.js";

function accountLine(account: CommerceAccount, detailed = false): string {
  const parts = [
    `- ${account.windowName || "Unnamed"}`,
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
    detailed && account.windowRemark ? `note: ${account.windowRemark}` : undefined,
  ];
  return parts.filter(Boolean).join(" | ");
}

export function formatCommerceAccounts(page: Page<CommerceAccount>): string {
  if (page.rows.length === 0) return "No ecommerce accounts found.";
  return [`Accounts: ${page.total}`, ...page.rows.map((account) => accountLine(account))].join(
    "\n",
  );
}

export function formatCommerceAccount(account: CommerceAccount): string {
  return `Account\n${accountLine(account, true)}`;
}
