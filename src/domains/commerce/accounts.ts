import { ProfileDomain } from "../browser/index.js";
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
    return this.profiles.list(params);
  }

  async get(dirId: string): Promise<CommerceAccount> {
    return this.profiles.get(dirId);
  }

  async create(input: CommerceAccountInput): Promise<CommerceAccount> {
    return this.profiles.create(input);
  }

  async update(dirId: string, patch: Partial<CommerceAccountInput>): Promise<void> {
    await this.profiles.update(dirId, patch);
  }

  open(dirId: string, options: CommerceAccountOpenOptions = {}) {
    return this.profiles.open(dirId, options);
  }

  close(dirId: string): Promise<void> {
    return this.profiles.close(dirId);
  }

  delete(dirIds: string[], options: CommerceAccountDeleteOptions = {}): Promise<void> {
    return this.profiles.delete(dirIds, options);
  }
}
