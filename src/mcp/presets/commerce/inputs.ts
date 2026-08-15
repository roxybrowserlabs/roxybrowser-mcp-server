import type {
  CommerceAccountInput,
  CommerceAccountListParams,
} from "../../../domains/commerce/index.js";
import { normalizeProfileInput, normalizeProfileListArgs } from "../browser/inputs.js";

export function normalizeCommerceAccountListArgs(
  args: Record<string, any>,
): CommerceAccountListParams {
  return normalizeProfileListArgs({
    ...args,
    name: args.keyword,
  });
}

export function normalizeCommerceAccountInput(args: Record<string, any>): CommerceAccountInput {
  const p = args.platform;
  const platformAccounts = p != null && typeof p === 'object' && !Array.isArray(p)
    ? [
        {
          platformUrl: typeof p.url === 'string' ? p.url : undefined,
          username: typeof p.username === 'string' ? p.username : undefined,
          password: typeof p.password === 'string' ? p.password : undefined,
          twoFactorKey: typeof p.twoFactorKey === 'string' ? p.twoFactorKey : undefined,
          remarks: typeof p.remarks === 'string' ? p.remarks : undefined,
        },
      ]
    : undefined;

  return normalizeProfileInput({
    ...args,
    platformAccounts,
  });
}
