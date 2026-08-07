export type SortDirection = 'asc' | 'desc'

export interface PaginationInfoInput {
  pageIndex: number
  pageSize: number
  totalItems: number
  totalPages?: number
}

export interface PaginationInfo {
  pageIndex: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  previousPageIndex: number | null
  nextPageIndex: number | null
  isCompleteResult: boolean
}

export interface PaginationSort {
  field: string
  direction: SortDirection
  humanMeaning?: string
}

export interface ExistenceGuidance {
  canCheckExactly: boolean
  preferredFilterFields: string[]
  warning: string
}

export type PaginationCompleteness =
  | 'COMPLETE_RESULT'
  | 'PARTIAL_PAGE_ONLY'
  | 'EMPTY_RESULT_SET'
  | 'PAGE_OUT_OF_RANGE'

export interface PaginatedToolResult<T> {
  kind: 'paginated_list'
  entity: string
  query: Record<string, unknown>
  items: T[]
  pagination: PaginationInfo
  sort?: PaginationSort
  filtersApplied: Record<string, unknown>
  existenceGuidance?: ExistenceGuidance
  completeness: PaginationCompleteness
}

export function buildPaginationInfo(info: PaginationInfoInput): PaginationInfo {
  const { pageIndex, pageSize, totalItems } = info
  const totalPages = info.totalPages ?? (totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize))
  const hasPreviousPage = pageIndex > 1 && totalPages > 0
  const hasNextPage = pageIndex < totalPages

  return {
    pageIndex,
    pageSize,
    totalItems,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    previousPageIndex: hasPreviousPage ? pageIndex - 1 : null,
    nextPageIndex: hasNextPage ? pageIndex + 1 : null,
    isCompleteResult: totalPages <= 1 && pageIndex <= Math.max(totalPages, 1),
  }
}

export function getPaginationCompleteness(pagination: PaginationInfo, itemCount: number): PaginationCompleteness {
  if (pagination.totalItems === 0)
    return 'EMPTY_RESULT_SET'
  if (itemCount === 0)
    return 'PAGE_OUT_OF_RANGE'
  if (pagination.isCompleteResult)
    return 'COMPLETE_RESULT'
  return 'PARTIAL_PAGE_ONLY'
}

export function formatPaginationText(options: {
  toolName: string
  pagination: PaginationInfo
  itemCount: number
  sort?: PaginationSort
  exactLookupHint?: string
  recoveryHint?: string
}): string {
  const { toolName, pagination, sort, exactLookupHint, recoveryHint } = options
  const completeness = getPaginationCompleteness(pagination, options.itemCount)
  const completenessText = completeness === 'PARTIAL_PAGE_ONLY'
    ? 'PARTIAL_PAGE_ONLY. Do not conclude an item does not exist from this page alone.'
    : completeness

  return [
    'Pagination:',
    `- currentPage: ${pagination.pageIndex}`,
    `- pageSize: ${pagination.pageSize}`,
    `- totalItems: ${pagination.totalItems}`,
    `- totalPages: ${pagination.totalPages}`,
    `- hasPreviousPage: ${pagination.hasPreviousPage}`,
    `- hasNextPage: ${pagination.hasNextPage}`,
    `- previousPageHint: ${pagination.previousPageIndex ? `Call ${toolName} with pageIndex=${pagination.previousPageIndex}` : 'No previous page'}`,
    `- nextPageHint: ${pagination.nextPageIndex ? `Call ${toolName} with pageIndex=${pagination.nextPageIndex}` : 'No next page'}`,
    `- completeness: ${completenessText}`,
    recoveryHint ? `- recoveryHint: ${recoveryHint}` : undefined,
    sort ? `- sort: ${sort.field} ${sort.direction}${sort.humanMeaning ? `. ${sort.humanMeaning}` : ''}` : undefined,
    exactLookupHint ? `- exactLookupHint: ${exactLookupHint}` : undefined,
  ].filter(Boolean).join('\n')
}

export function buildPaginatedToolResult<T>(options: {
  entity: string
  query: Record<string, unknown>
  items: T[]
  pagination: PaginationInfo
  sort?: PaginationSort
  filtersApplied?: Record<string, unknown>
  existenceGuidance?: ExistenceGuidance
}): PaginatedToolResult<T> {
  return {
    kind: 'paginated_list',
    entity: options.entity,
    query: options.query,
    items: options.items,
    pagination: options.pagination,
    sort: options.sort,
    filtersApplied: options.filtersApplied ?? {},
    existenceGuidance: options.existenceGuidance,
    completeness: getPaginationCompleteness(options.pagination, options.items.length),
  }
}

export function paginatedToolResponse<T>(text: string, structuredContent: PaginatedToolResult<T>) {
  void structuredContent

  return {
    content: [{ type: 'text', text }],
    // structuredContent,
    // _meta: {
    //   roxyPagination: structuredContent,
    // },
  }
}

export function normalizeSerialNumber(value: unknown): string | undefined {
  if (typeof value !== 'string' && typeof value !== 'number')
    return undefined

  const text = String(value).trim()
  if (!text)
    return undefined

  const match = text.match(/^(?:[A-Za-z]+-)?(\d+)$/)
  return match?.[1] ?? text
}
