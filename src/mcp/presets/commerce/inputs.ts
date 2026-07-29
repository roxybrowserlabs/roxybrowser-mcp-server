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
  const platformAccounts = args.platform
    ? [
        {
          platformUrl: args.platform.url,
          username: args.platform.username,
          password: args.platform.password,
          twoFactorKey: args.platform.twoFactorKey,
          remarks: args.platform.remarks,
        },
      ]
    : undefined;

  return normalizeProfileInput({
    ...args,
    platformAccounts,
  });
}
