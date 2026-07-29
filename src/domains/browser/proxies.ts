import type { RawProxy, RoxyApiClient } from '../../api/index.js'
import { removeUndefined } from '../../sdk/shared/normalize.js'
import { toPage, toPageRequest } from '../../sdk/shared/pagination.js'
import { ensureSuccess, unwrapData } from '../../sdk/shared/result.js'
import type { ProxyInput, ProxyListParams } from './types.js'

const sourceMap = {
  user: '0',
  store: '1',
} as const

const checkStatusMap = {
  passed: 1,
  failed: 2,
  unknown: 0,
} as const

export class ProxyDomain {
  constructor(private readonly api: RoxyApiClient) {}

  async list(params: ProxyListParams = {}) {
    const data = unwrapData(await this.api.proxy.listMerged(removeUndefined({
      ...toPageRequest(params),
      type: params.type === 'available' ? 'available_list' : undefined,
      proxyType: params.source && params.source !== 'all' ? sourceMap[params.source] : undefined,
      proxyBindStatus: params.bindStatus === 'all'
        ? undefined
        : params.bindStatus === 'bound'
          ? '1'
          : params.bindStatus === 'unbound'
            ? '0'
            : undefined,
      proxyAutoRenew: params.autoRenew === undefined ? undefined : params.autoRenew ? '1' : '0',
      country: params.country,
      check_status: params.checkStatus ? checkStatusMap[params.checkStatus] : undefined,
      orderName: params.sortBy,
      orderType: params.sortOrder,
    }) as any))

    return toPage({
      total: data.total,
      rows: data.rows.map(toProxy),
    }, params)
  }

  async get(id: number) {
    const data = unwrapData(await this.api.proxy.detail({ id }))
    const raw = Array.isArray((data as any).rows) ? (data as any).rows[0] : data as RawProxy
    if (!raw)
      throw new Error(`Proxy not found: ${id}`)
    return toProxy(raw)
  }

  async create(input: ProxyInput): Promise<void> {
    ensureSuccess(await this.api.proxy.create(toProxyRequest(input) as any))
  }

  async createMany(inputs: ProxyInput[]): Promise<void> {
    ensureSuccess(await this.api.proxy.batchCreate({
      proxyList: inputs.map(toProxyRequest),
    }))
  }

  async update(id: number, patch: Partial<ProxyInput>): Promise<void> {
    ensureSuccess(await this.api.proxy.modify({
      id,
      ...toProxyRequest(patch),
      proxyCategory: patch.protocol,
    }))
  }

  async delete(ids: number[]): Promise<void> {
    ensureSuccess(await this.api.proxy.delete({ ids }))
  }

  async detect(id: number) {
    return unwrapData(await this.api.proxy.detect({ id }))
  }

  async detectChannels() {
    return unwrapData(await this.api.proxy.detectChannels()) ?? []
  }
}

export function toProxy(raw: RawProxy) {
  return {
    id: raw.id,
    source: raw.dataType === 'buyProxy' ? 'store' : 'user',
    protocol: raw.protocol,
    host: raw.host,
    port: raw.port,
    remark: raw.remark,
    checkStatus: raw.checkStatus,
    bindCount: raw.bindCount,
    raw,
  }
}

function toProxyRequest(input: Partial<ProxyInput>): Record<string, unknown> {
  return removeUndefined({
    protocol: input.protocol,
    host: input.host,
    port: input.port,
    ipType: input.ipType ?? 'IPV4',
    checkChannel: input.checkChannel,
    proxyUserName: input.username,
    proxyPassword: input.password,
    refreshUrl: input.refreshUrl,
    remark: input.remark,
  })
}
