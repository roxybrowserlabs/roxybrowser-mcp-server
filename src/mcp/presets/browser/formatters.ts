import type { BrowserProfile, PlatformAccount, ProxyListParams } from '../../../domains/browser/index.js'
import type { Page } from '../../../sdk/shared/pagination.js'

export function formatProfiles(page: Page<BrowserProfile>): string {
  if (page.rows.length === 0)
    return 'No profiles found.'

  return [
    `Found ${page.total} profile(s).`,
    '',
    ...page.rows.map(profile => [
      `Profile: ${profile.name ?? 'Unnamed'}`,
      `  - id: ${profile.id}`,
      `  - core: ${profile.core?.type ?? 'Unknown'} ${profile.core?.version ?? ''}`.trimEnd(),
      `  - os: ${profile.os?.name ?? 'Unknown'} ${profile.os?.version ?? ''}`.trimEnd(),
    ].join('\n')),
  ].join('\n')
}

export function formatProfile(profile: BrowserProfile): string {
  return [
    `Profile: ${profile.name ?? 'Unnamed'}`,
    `id: ${profile.id}`,
    `core: ${profile.core?.type ?? 'Unknown'} ${profile.core?.version ?? ''}`.trimEnd(),
    `os: ${profile.os?.name ?? 'Unknown'} ${profile.os?.version ?? ''}`.trimEnd(),
  ].join('\n')
}

export function formatPlatformAccounts(page: Page<PlatformAccount>): string {
  if (page.rows.length === 0)
    return 'No platform accounts found.'

  return [
    `Found ${page.total} platform account(s).`,
    '',
    ...page.rows.map(account => [
      `Platform account: ${account.platformUrl ?? 'Unknown platform'}`,
      `  - id: ${account.id}`,
      `  - username: ${account.username ?? 'N/A'}`,
      `  - remarks: ${account.remarks ?? 'N/A'}`,
    ].join('\n')),
  ].join('\n')
}

export function normalizeProxyListArgs(args: Record<string, any>): ProxyListParams {
  return {
    page: args.page,
    pageSize: args.pageSize,
    source: args.source,
    type: args.type,
    bindStatus: args.bindStatus,
    autoRenew: args.autoRenew,
    country: args.country,
    checkStatus: args.checkStatus,
    sortBy: args.sortBy,
    sortOrder: args.sortOrder,
  }
}
