import type { RoxyApiClient } from "../../api/index.js";
import { removeUndefined } from "../../sdk/shared/normalize.js";
import { toPage, toPageRequest, type PaginationParams } from "../../sdk/shared/pagination.js";
import { ensureSuccess, unwrapData } from "../../sdk/shared/result.js";
import type { PlatformAccountInput } from "./types.js";

export class PlatformAccountDomain {
  constructor(private readonly api: RoxyApiClient) {}

  async list(params: PaginationParams = {}) {
    const data = unwrapData(await this.api.account.list(toPageRequest(params) as any));
    return toPage(data, params);
  }

  async create(input: PlatformAccountInput) {
    const data = unwrapData(await this.api.account.create(removeUndefined(input) as any));
    return data.platform_id;
  }

  async createMany(inputs: PlatformAccountInput[]): Promise<void> {
    ensureSuccess(
      await this.api.account.batchCreate({
        accountList: inputs.map(removeUndefined),
      }),
    );
  }

  async update(id: number, patch: Partial<PlatformAccountInput>): Promise<void> {
    ensureSuccess(
      await this.api.account.modify({
        id,
        ...removeUndefined(patch),
      }),
    );
  }

  async delete(ids: number[]): Promise<void> {
    ensureSuccess(await this.api.account.delete({ ids }));
  }
}
