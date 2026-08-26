import { err, ok, type Result } from "@/core/result/result";
import { horizonServer } from "@/core/horizon/client";
import { classifyHorizonError } from "@/core/horizon/errors";
import type { StellarNetwork } from "@/core/network/types";
import type { AccountMergePreflightErrorCode, AccountMergePreflightInput, AccountMergePreflightResult, BlockingItem } from "@/features/account-merge-preflight/types";

export async function checkAccountMergePreflight(
  input: AccountMergePreflightInput,
  network: StellarNetwork
): Promise<Result<AccountMergePreflightResult, AccountMergePreflightErrorCode>> {
  if (input.source === input.destination) {
    return err("same_account");
  }

  const server = horizonServer(network);

  // 1. Check destination account
  try {
    await server.loadAccount(input.destination);
  } catch (errPayload) {
    const { code } = classifyHorizonError(errPayload);
    if (code === "not_found") {
      return err("destination_not_found");
    }
    return err("request_failed");
  }

  // 2. Check source account
  let sourceAccount;
  try {
    sourceAccount = await server.loadAccount(input.source);
  } catch (errPayload) {
    const { code } = classifyHorizonError(errPayload);
    if (code === "not_found") {
      return err("source_not_found");
    }
    return err("request_failed");
  }

  const blockingItems: BlockingItem[] = [];

  // Trustlines (any balance that is not native)
  for (const balance of sourceAccount.balances) {
    if (balance.asset_type !== "native") {
      const code = 'asset_code' in balance ? balance.asset_code : 'liquidity_pool_shares';
      blockingItems.push({
        type: "trustline",
        description: code || "Unknown Asset"
      });
    }
  }

  // Data entries
  if (sourceAccount.data_attr) {
    for (const key of Object.keys(sourceAccount.data_attr)) {
      blockingItems.push({
        type: "data_entry",
        description: key
      });
    }
  }

  // Signers (any signer other than the account itself)
  for (const signer of sourceAccount.signers) {
    if (signer.key !== input.source) {
      blockingItems.push({
        type: "signer",
        description: signer.key
      });
    }
  }

  // Sponsorships
  if (sourceAccount.num_sponsoring > 0) {
    blockingItems.push({
      type: "sponsorship",
      description: `${sourceAccount.num_sponsoring} sponsored`
    });
  }
  if (sourceAccount.num_sponsored > 0) {
    blockingItems.push({
      type: "sponsorship",
      description: `${sourceAccount.num_sponsored} sponsoring`
    });
  }
  if (sourceAccount.sponsor) {
    blockingItems.push({
      type: "sponsorship",
      description: `Sponsored by ${sourceAccount.sponsor}`
    });
  }

  // Offers
  try {
    const offersPage = await server.offers().forAccount(input.source).call();
    for (const offer of offersPage.records) {
      blockingItems.push({
        type: "offer",
        description: offer.id.toString()
      });
    }
  } catch {
    return err("request_failed");
  }

  const nativeBalance = sourceAccount.balances.find((b) => b.asset_type === "native");
  const transferableXlm = nativeBalance ? nativeBalance.balance : "0";

  return ok({
    isMergeable: blockingItems.length === 0,
    transferableXlm,
    blockingItems
  });
}
