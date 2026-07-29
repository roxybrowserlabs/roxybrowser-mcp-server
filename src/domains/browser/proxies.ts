import type { RawProxy, RoxyApiClient } from "../../api/index.js";
import { removeUndefined } from "../../sdk/shared/normalize.js";
import { toPage, toPageRequest } from "../../sdk/shared/pagination.js";
import { ensureSuccess, unwrapData } from "../../sdk/shared/result.js";
import type { ProxyInput, ProxyListParams } from "./types.js";

export class ProxyDomain {
  constructor(private readonly api: RoxyApiClient) {}

  async list(params: ProxyListParams = {}) {
    const { page: _page, pageSize: _pageSize, ...apiParams } = params;
    const data = unwrapData(
      await this.api.proxy.listMerged(
        removeUndefined({
          ...toPageRequest(params),
          ...apiParams,
        }) as any,
      ),
    );
    return toPage(data, params);
  }

  async get(id: number) {
    const data = unwrapData(await this.api.proxy.detail({ id }));
    const proxy = Array.isArray((data as any).rows) ? (data as any).rows[0] : (data as RawProxy);
    if (!proxy) throw new Error(`Proxy not found: ${id}`);
    return proxy;
  }

  async create(input: ProxyInput): Promise<void> {
    ensureSuccess(await this.api.proxy.create(removeUndefined(input) as any));
  }

  async createMany(inputs: ProxyInput[]): Promise<void> {
    ensureSuccess(
      await this.api.proxy.batchCreate({
        proxyList: inputs.map(removeUndefined),
      }),
    );
  }

  async update(id: number, patch: Partial<ProxyInput>): Promise<void> {
    ensureSuccess(
      await this.api.proxy.modify({
        id,
        ...removeUndefined(patch),
      }),
    );
  }

  async delete(ids: number[]): Promise<void> {
    ensureSuccess(await this.api.proxy.delete({ ids }));
  }

  async detect(id: number) {
    return unwrapData(await this.api.proxy.detect({ id }));
  }

  async detectChannels() {
    return unwrapData(await this.api.proxy.detectChannels()) ?? [];
  }
}
