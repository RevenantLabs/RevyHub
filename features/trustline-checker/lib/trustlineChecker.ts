import { err, ok, type Result } from "@/core/result/result";
import { horizonServer } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { toTrustlineErrorCode } from "@/features/trustline-checker/lib/trustlineChecker.errors";
import type {
  TrustlineErrorCode,
  TrustlineInput,
  TrustlineResult
} from "@/features/trustline-checker/types";

interface CreditBalance {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
  limit?: string;
  is_authorized?: boolean;
  is_authorized_to_maintain_liabilities?: boolean;
}

/** Pure matcher, exported so the comparison rules can be tested directly. */
export function findTrustline(
  balances: CreditBalance[],
  assetCode: string,
  issuerId: string
): TrustlineResult {
  const credit = balances.filter(
    (balance) =>
      balance.asset_type !== "native" && balance.asset_type !== "liquidity_pool_shares"
  );

  // Asset codes are case-sensitive on the ledger, but users routinely type
  // "usdc". Compare case-insensitively and report the ledger's own casing.
  const match = credit.find(
    (balance) =>
      balance.asset_code?.toUpperCase() === assetCode.toUpperCase() &&
      balance.asset_issuer === issuerId
  );

  if (match) {
    return {
      exists: true,
      assetCode: match.asset_code ?? assetCode,
      issuerId,
      balance: match.balance,
      limit: match.limit ?? "0",
      authorized: match.is_authorized !== false,
      authorizedToMaintainLiabilities: match.is_authorized_to_maintain_liabilities === true
    };
  }

  // A wrong issuer for the right code is the single most common mistake, so
  // surface the issuers this account actually trusts for that code.
  const otherIssuers = credit
    .filter((balance) => balance.asset_code?.toUpperCase() === assetCode.toUpperCase())
    .map((balance) => balance.asset_issuer)
    .filter((issuer): issuer is string => Boolean(issuer));

  return { exists: false, assetCode, issuerId, otherIssuers };
}

export async function checkTrustline(
  input: TrustlineInput,
  network: StellarNetwork
): Promise<Result<TrustlineResult, TrustlineErrorCode>> {
  try {
    const account = await horizonServer(network).loadAccount(input.accountId);
    return ok(
      findTrustline(account.balances as CreditBalance[], input.assetCode, input.issuerId)
    );
  } catch (error) {
    return err(toTrustlineErrorCode(error));
  }
}
