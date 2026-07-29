import type { CommerceAccount } from "../../../domains/commerce/index.js";
import type { Page } from "../../../sdk/shared/pagination.js";

export function formatCommerceAccounts(page: Page<CommerceAccount>): string {
  if (page.rows.length === 0) return "No ecommerce accounts found.";

  return [
    `Found ${page.total} ecommerce account(s).`,
    "",
    ...page.rows.map((account) =>
      [
        `windowName: ${account.windowName ?? "Unnamed"}`,
        `  - dirId: ${account.dirId}`,
        `  - projectId: ${account.projectId ?? "N/A"}`,
      ].join("\n"),
    ),
  ].join("\n");
}

export function formatCommerceAccount(account: CommerceAccount): string {
  return [
    `windowName: ${account.windowName ?? "Unnamed"}`,
    `dirId: ${account.dirId}`,
    `projectId: ${account.projectId ?? "N/A"}`,
  ].join("\n");
}
