import type { ProfileCreateInput } from "../../api/index.js";
import { GeneratedProfileDomain } from "../../generated/roxy-browser-client.js";
import { unwrapData } from "../../sdk/shared/result.js";

export class ProfileDomain extends GeneratedProfileDomain {
  async createWithResult(input: ProfileCreateInput) {
    const response = await this.api.browser.create(input);
    const data = unwrapData(response);
    return { id: data.dirId, message: response.msg };
  }
}
