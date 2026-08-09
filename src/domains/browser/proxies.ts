import type { ProxyInput, RawProxy } from "../../api/index.js";
import { GeneratedProxyDomain } from "../../generated/roxy-browser-client.js";
import { ensureSuccess, unwrapData } from "../../sdk/shared/result.js";

export class ProxyDomain extends GeneratedProxyDomain {
  async createWithResult(input: ProxyInput) {
    const response = await this.api.proxy.create(input);
    ensureSuccess(response);
    return { message: response.msg };
  }

  async get(id: number) {
    const data = unwrapData(await this.api.proxy.detail({ id }));
    const proxy = Array.isArray((data as any).rows) ? (data as any).rows[0] : (data as RawProxy);
    if (!proxy) throw new Error(`Proxy not found: ${id}`);
    return proxy;
  }
}
