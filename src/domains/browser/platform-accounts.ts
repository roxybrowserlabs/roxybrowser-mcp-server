import type { PlatformAccountInput } from "../../api/index.js";
import { GeneratedPlatformAccountDomain } from "../../generated/roxy-browser-client.js";
import { unwrapData } from "../../sdk/shared/result.js";

export class PlatformAccountDomain extends GeneratedPlatformAccountDomain {
  async createWithResult(input: PlatformAccountInput) {
    const response = await this.api.account.create(input);
    const data = unwrapData(response);
    return { id: data.platform_id, message: response.msg };
  }
}
