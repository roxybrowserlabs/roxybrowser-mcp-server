import type { CommerceAccount } from "../../../domains/commerce/index.js";
import type { Page } from "../../../sdk/shared/pagination.js";
import { formatJsonDetail, pagedTable } from "../formatting.js";

function projectValue(account: CommerceAccount): string {
  if (account.projectName && account.projectId !== undefined) {
    return `${account.projectName} (${account.projectId})`;
  }
  return account.projectName || (account.projectId !== undefined ? String(account.projectId) : "");
}

function statusValue(status: CommerceAccount["openStatus"]): string {
  if (status === true || status === 1) return "open";
  if (status === false || status === 0) return "closed";
  return "";
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
      statusValue(account.openStatus),
    ]),
    "No ecommerce accounts found.",
  );
}

export function formatCommerceAccount(account: CommerceAccount): string {
  return formatJsonDetail(account);
}
