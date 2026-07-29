import type { RoxyApiClient, RawPlatformAccount } from '../../api/index.js'
import { removeUndefined } from '../../sdk/shared/normalize.js'
import { toPage, toPageRequest, type PaginationParams } from '../../sdk/shared/pagination.js'
import { ensureSuccess, unwrapData } from '../../sdk/shared/result.js'
import type { PlatformAccount, PlatformAccountInput } from './types.js'

export class PlatformAccountDomain {
  constructor(private readonly api: RoxyApiClient) {}

  async list(params: PaginationParams = {}) {
    const data = unwrapData(await this.api.account.list(toPageRequest(params) as any))
    return toPage({
      total: data.total,
      rows: data.rows.map(toPlatformAccount),
    }, params)
  }

  async create(input: PlatformAccountInput) {
    const data = unwrapData(await this.api.account.create(toPlatformAccountRequest(input) as any))
    return data.platform_id
  }

  async createMany(inputs: PlatformAccountInput[]): Promise<void> {
    ensureSuccess(await this.api.account.batchCreate({
      accountList: inputs.map(toPlatformAccountRequest),
    }))
  }

  async update(id: number, patch: Partial<PlatformAccountInput>): Promise<void> {
    ensureSuccess(await this.api.account.modify({
      id,
      ...toPlatformAccountRequest(patch),
    }))
  }

  async delete(ids: number[]): Promise<void> {
    ensureSuccess(await this.api.account.delete({ ids }))
  }
}

export function toPlatformAccount(raw: RawPlatformAccount): PlatformAccount {
  return {
    id: raw.id,
    platformUrl: raw.platformUrl,
    username: raw.platformUserName,
    remarks: raw.platformRemarks,
    raw,
  }
}

export function toPlatformAccountRequest(input: Partial<PlatformAccountInput>): Record<string, unknown> {
  return removeUndefined({
    ...(input.raw ?? {}),
    platformUrl: input.platformUrl,
    platformUserName: input.username,
    platformPassword: input.password,
    platformEfa: input.twoFactorKey,
    platformRemarks: input.remarks,
  })
}
