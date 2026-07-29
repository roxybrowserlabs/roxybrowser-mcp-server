import type { RoxyApiClient, RawBrowserProfile } from "../../api/index.js";
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
    const rawParams = removeUndefined({
      ...toPageRequest(params),
      dirIds: params.dirIds?.join(","),
      projectIds: params.projectIds?.join(","),
      windowName: params.name,
      windowSortNum: params.serialNumber,
      os: params.os,
    });
    const data = unwrapData(await this.api.browser.list(rawParams as any));
    return toPage(
      {
        total: data.total,
        rows: data.rows.map(toProfile),
      },
      params,
    );
  }

  async get(dirId: string): Promise<BrowserProfile> {
    const data = unwrapData(await this.api.browser.detail({ dirId }));
    const profile = data.rows[0];
    if (!profile) throw new Error(`Profile not found: ${dirId}`);
    return toProfile(profile);
  }

  async create(input: ProfileCreateInput): Promise<BrowserProfile> {
    const data = unwrapData(await this.api.browser.create(toProfileCreateRequest(input)));
    return this.get(data.dirId);
  }

  async update(dirId: string, patch: ProfileUpdateInput): Promise<void> {
    ensureSuccess(
      await this.api.browser.modify({
        ...toProfileCreateRequest(patch),
        dirId,
      }),
    );
  }

  async delete(dirIds: OneOrMany<string>, options: ProfileDeleteOptions = {}): Promise<void> {
    ensureSuccess(
      await this.api.browser.delete({
        dirIds: asArray(dirIds),
        isSoftDelete: options.soft ?? true,
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
              forceOpen: options.force,
              args: options.args,
              headless: options.headless,
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

  async connectionInfo(dirIds?: string[]) {
    return (
      unwrapData(
        await this.api.browser.connectionInfo({
          dirIds: dirIds?.join(","),
        }),
      ) ?? []
    );
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

export function toProfile(raw: RawBrowserProfile): BrowserProfile {
  return {
    dirId: raw.dirId,
    serialNumber: raw.windowSortNum,
    name: raw.windowName,
    core: {
      type: raw.coreType,
      version: raw.coreVersion,
    },
    os: {
      name: raw.os,
      version: raw.osVersion,
    },
    remark: raw.windowRemark,
    raw,
  };
}

export function toProfileCreateRequest(
  input: ProfileCreateInput | ProfileUpdateInput,
): Record<string, unknown> {
  return removeUndefined({
    ...input.raw,
    windowName: input.name,
    projectId: input.projectId,
    coreType: input.core?.type,
    coreVersion: input.core?.version,
    os: input.os?.name,
    osVersion: input.os?.version,
    defaultOpenUrl: input.urls,
    windowRemark: input.remark,
    proxyInfo:
      input.proxyId !== undefined ? { moduleId: input.proxyId, proxyMethod: "choose" } : undefined,
    windowPlatformList: input.platformAccounts?.map((account) => ({
      ...account.raw,
      platformUrl: account.platformUrl,
      platformUserName: account.username,
      platformPassword: account.password,
      platformEfa: account.twoFactorKey,
      platformRemarks: account.remarks,
    })),
  });
}
