import type { RoxyApiClient } from "../../api/index.js";
import { asArray, type OneOrMany } from "../../sdk/shared/ids.js";
import { removeUndefined } from "../../sdk/shared/normalize.js";
import { toPage, toPageRequest } from "../../sdk/shared/pagination.js";
import { ensureSuccess, unwrapData } from "../../sdk/shared/result.js";
import type {
  BrowserProfile,
  ProfileCreateInput,
  ProfileDeleteOptions,
  ProfileListParams,
  ProfileOpenOptions,
  ProfileUpdateInput,
} from "./types.js";

export class ProfileDomain {
  constructor(private readonly api: RoxyApiClient) {}

  async list(params: ProfileListParams = {}) {
    const { page: _page, pageSize: _pageSize, ...apiParams } = params;
    const rawParams = removeUndefined({
      ...toPageRequest(params),
      ...apiParams,
    });
    const data = unwrapData(await this.api.browser.list(rawParams as any));
    return toPage(data, params);
  }

  async get(dirId: string): Promise<BrowserProfile> {
    const data = unwrapData(await this.api.browser.detail({ dirId }));
    const profile = data.rows[0];
    if (!profile) throw new Error(`Profile not found: ${dirId}`);
    return profile;
  }

  async create(input: ProfileCreateInput): Promise<BrowserProfile> {
    const data = unwrapData(await this.api.browser.create(removeUndefined(input)));
    return this.get(data.dirId);
  }

  async update(dirId: string, patch: ProfileUpdateInput): Promise<void> {
    ensureSuccess(
      await this.api.browser.modify({
        ...removeUndefined(patch),
        dirId,
      }),
    );
  }

  async delete(dirIds: OneOrMany<string>, options: ProfileDeleteOptions = {}): Promise<void> {
    ensureSuccess(
      await this.api.browser.delete({
        dirIds: asArray(dirIds),
        isSoftDelete: options.isSoftDelete ?? true,
      }),
    );
  }

  async open(dirIds: OneOrMany<string>, options: ProfileOpenOptions = {}) {
    const opened = [];
    for (const dirId of asArray(dirIds)) {
      opened.push(
        unwrapData(
          await this.api.browser.open(
            removeUndefined({
              dirId,
              ...options,
            }),
          ),
        ),
      );
    }
    return Array.isArray(dirIds) ? opened : opened[0];
  }

  async close(dirIds: OneOrMany<string>): Promise<void> {
    for (const dirId of asArray(dirIds)) {
      ensureSuccess(await this.api.browser.close({ dirId }));
    }
  }

  async connectionInfo(dirIds?: string) {
    return unwrapData(await this.api.browser.connectionInfo({ dirIds })) ?? [];
  }

  async randomizeFingerprint(dirId: string): Promise<void> {
    ensureSuccess(await this.api.browser.randomEnv({ dirId }));
  }

  async clearLocalCache(dirIds: OneOrMany<string>, options: { type?: string } = {}): Promise<void> {
    ensureSuccess(
      await this.api.browser.clearLocalCache(
        removeUndefined({
          dirIds: asArray(dirIds),
          type: options.type,
        }),
      ),
    );
  }

  async clearServerCache(dirIds: OneOrMany<string>): Promise<void> {
    ensureSuccess(
      await this.api.browser.clearServerCache({
        dirIds: asArray(dirIds),
      }),
    );
  }
}
