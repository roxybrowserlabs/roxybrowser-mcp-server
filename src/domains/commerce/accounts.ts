import { ProfileDomain, type BrowserProfile } from "../browser/index.js";
import type {
  CommerceAccount,
  CommerceAccountDeleteOptions,
  CommerceAccountInput,
  CommerceAccountListParams,
  CommerceAccountOpenOptions,
} from "./types.js";

export class CommerceAccountDomain {
  constructor(private readonly profiles: ProfileDomain) {}

  async list(params: CommerceAccountListParams = {}) {
    const page = await this.profiles.list({
      page: params.page,
      pageSize: params.pageSize,
      name: params.keyword,
      projectIds: params.projectIds,
    });
    return {
      ...page,
      rows: page.rows.map(toCommerceAccount),
    };
  }

  async get(id: string): Promise<CommerceAccount> {
    return toCommerceAccount(await this.profiles.get(id));
  }

  async create(input: CommerceAccountInput): Promise<CommerceAccount> {
    const profile = await this.profiles.create({
      name: input.name,
      projectId: input.projectId,
      proxyId: input.proxyId,
      urls: input.urls ?? (input.platform?.url ? [input.platform.url] : undefined),
      platformAccounts: input.platform
        ? [
            {
              platformUrl: input.platform.url,
              username: input.platform.username,
              password: input.platform.password,
              twoFactorKey: input.platform.twoFactorKey,
              remarks: input.platform.remarks,
            },
          ]
        : undefined,
      raw: input.raw,
    });
    return toCommerceAccount(profile);
  }

  async update(id: string, patch: Partial<CommerceAccountInput>): Promise<void> {
    await this.profiles.update(id, {
      name: patch.name,
      projectId: patch.projectId,
      proxyId: patch.proxyId,
      urls: patch.urls,
      raw: patch.raw,
    });
  }

  open(id: string, options: CommerceAccountOpenOptions = {}) {
    return this.profiles.open(id, options);
  }

  close(id: string): Promise<void> {
    return this.profiles.close(id);
  }

  delete(ids: string[], options: CommerceAccountDeleteOptions = {}): Promise<void> {
    return this.profiles.delete(ids, options);
  }
}

function toCommerceAccount(profile: BrowserProfile): CommerceAccount {
  return {
    id: profile.id,
    name: profile.name,
    projectId: profile.raw.projectId as number | undefined,
    raw: profile.raw,
  };
}
