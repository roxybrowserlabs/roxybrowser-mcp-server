import type { CommerceAccount } from "../../../domains/commerce/index.js";
import type { Page } from "../../../sdk/shared/pagination.js";
import { isVersionAtLeast, ROXY_BROWSER_VERSION_4_0_4 } from "../../../version.js";
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

export function formatCommerceAccounts(
  page: Page<CommerceAccount>,
  roxyBrowserVersion?: string,
): string {
  const showProject = Boolean(
    roxyBrowserVersion &&
      isVersionAtLeast(roxyBrowserVersion, ROXY_BROWSER_VERSION_4_0_4),
  );
  const headers = showProject ? ["Name", "dirId", "Project", "Status"] : ["Name", "dirId", "Status"];
  const rows = page.rows.map((account) => {
    const base = [account.windowName, account.dirId, statusValue(account.openStatus)];
    return showProject ? [base[0], base[1], projectValue(account), base[2]] : base;
  });
  return pagedTable(
    "Accounts",
    page,
    headers,
    rows,
    "No ecommerce accounts found.",
  );
}

export function formatCommerceAccount(account: CommerceAccount): string {
  return formatJsonDetail(account);
}
