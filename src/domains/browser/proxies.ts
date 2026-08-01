import type { RawProxy } from "../../api/index.js";
import { GeneratedProxyDomain } from "../../generated/roxy-browser-client.js";
import { unwrapData } from "../../sdk/shared/result.js";

export class ProxyDomain extends GeneratedProxyDomain {
  async get(id: number) {
    const data = unwrapData(await this.api.proxy.detail({ id }));
    const proxy = Array.isArray((data as any).rows) ? (data as any).rows[0] : (data as RawProxy);
    if (!proxy) throw new Error(`Proxy not found: ${id}`);
    return proxy;
  }
}
