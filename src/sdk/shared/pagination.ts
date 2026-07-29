import type { PageData, PageRequest } from '../../api/index.js'

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface Page<T> {
  total: number
  rows: T[]
  page: number
  pageSize: number
}

export function toPageRequest(params: PaginationParams = {}): PageRequest {
  return {
    page_index: params.page,
    page_size: params.pageSize,
  }
}

export function toPage<T>(data: PageData<T> | undefined, params: PaginationParams = {}): Page<T> {
  return {
    total: data?.total ?? 0,
    rows: data?.rows ?? [],
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 15,
  }
}
