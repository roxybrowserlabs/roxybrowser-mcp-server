import type { Page } from "../../sdk/shared/pagination.js";

type MarkdownCell = string | number | boolean | null | undefined;

function cell(value: MarkdownCell): string {
  if (value === undefined || value === null || value === "") return "";
  return String(value).replaceAll("|", "\\|").replaceAll(/\r?\n/g, " ");
}

export function markdownTable(headers: string[], rows: MarkdownCell[][]): string {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(cell).join(" | ")} |`),
  ].join("\n");
}

function pageHeading<T>(label: string, page: Page<T>): string {
  const currentPage = page.page ?? 1;
  const pageSize = page.pageSize ?? (page.rows.length || 15);
  const pageCount = Math.max(1, Math.ceil(page.total / pageSize));
  const parts = [
    `${label}: ${page.total} total`,
    `page ${currentPage}/${pageCount}`,
    `pageSize ${pageSize}`,
    currentPage < pageCount ? `nextPage ${currentPage + 1}` : undefined,
  ];
  return parts.filter((part): part is string => Boolean(part)).join(" | ");
}

export function pagedTable<T>(
  label: string,
  page: Page<T>,
  headers: string[],
  rows: MarkdownCell[][],
  emptyMessage: string,
): string {
  const heading = pageHeading(label, page);
  return rows.length === 0
    ? `${heading}\n${emptyMessage}`
    : `${heading}\n${markdownTable(headers, rows)}`;
}
