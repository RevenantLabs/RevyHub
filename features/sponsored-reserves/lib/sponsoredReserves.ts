import { ok, err, type Result } from "@/core/result/result";
import { horizonServer } from "@/core/horizon/client";
import type { StellarNetwork } from "@/core/network/types";
import { toSponsoredReservesErrorCode } from "@/features/sponsored-reserves/lib/sponsoredReserves.errors";
import { formatBalanceDetails } from "@/features/sponsored-reserves/lib/format";
import type {
  SponsoredReservesErrorCode,
  SponsoredReservesInput,
  SponsoredReservesResultData,
  SponsoredEntry,
  SponsoringEntry
} from "@/features/sponsored-reserves/types";

export async function loadSponsoredReserves(
  { accountId }: SponsoredReservesInput,
  network: StellarNetwork
): Promise<Result<SponsoredReservesResultData, SponsoredReservesErrorCode>> {
  try {
    const server = horizonServer(network);
    
    const account = await server.loadAccount(accountId);
    const sponsoredByOthers: SponsoredEntry[] = [];
    
    if (account.sponsor && account.sponsor !== accountId) {
      sponsoredByOthers.push({ type: "account", details: "Account Reserve", sponsor: account.sponsor });
    }
    
    for (const balance of account.balances) {
      if (balance.sponsor && balance.sponsor !== accountId) {
        sponsoredByOthers.push({ type: "balance", details: formatBalanceDetails(balance), sponsor: balance.sponsor });
      }
    }
    
    for (const signer of account.signers) {
      if (signer.sponsor && signer.sponsor !== accountId) {
        sponsoredByOthers.push({ type: "signer", details: signer.key, sponsor: signer.sponsor });
      }
    }
    
    const sponsoringForOthers: SponsoringEntry[] = [];
    const sponsoredAccounts = await server.accounts().sponsor(accountId).call();
    
    for (const acc of sponsoredAccounts.records) {
      if (acc.sponsor === accountId && acc.account_id !== accountId) {
        sponsoringForOthers.push({ type: "account", details: "Account Reserve", accountSponsored: acc.account_id });
      }
      
      for (const balance of acc.balances) {
        if (balance.sponsor === accountId && acc.account_id !== accountId) {
          sponsoringForOthers.push({ type: "balance", details: formatBalanceDetails(balance), accountSponsored: acc.account_id });
        }
      }
      
      for (const signer of acc.signers) {
        if (signer.sponsor === accountId && acc.account_id !== accountId) {
          sponsoringForOthers.push({ type: "signer", details: signer.key, accountSponsored: acc.account_id });
        }
      }
    }

    return ok({ accountId, sponsoredByOthers, sponsoringForOthers });
  } catch (error) {
    return err(toSponsoredReservesErrorCode(error));
  }
}
