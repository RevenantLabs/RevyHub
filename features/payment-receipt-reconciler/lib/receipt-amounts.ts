import { assetKey, toStroops } from "@/features/payment-receipt-reconciler/lib/format";
import type {
  AssetAmount,
  EffectLink,
  ReceiptAsset,
  ReceiptTotals
} from "@/features/payment-receipt-reconciler/types";

interface Accumulator {
  asset: ReceiptAsset;
  stroops: bigint;
}

/**
 * Sums exact debit and credit amounts by asset code + issuer.
 *
 * Addition is done in stroops via BigInt so two Horizon amount strings never
 * pass through floating point. The charged fee is kept separate — it is not a
 * payment transfer and must not be folded into debit totals.
 */
export function sumReceiptAmounts(
  links: readonly EffectLink[],
  feeCharged: string
): ReceiptTotals {
  const debitMap = new Map<string, Accumulator>();
  const creditMap = new Map<string, Accumulator>();

  for (const link of links) {
    for (const debit of link.debits) {
      accumulate(debitMap, debit.asset, debit.amount);
    }
    for (const credit of link.credits) {
      accumulate(creditMap, credit.asset, credit.amount);
    }
  }

  return {
    debits: toAssetAmounts(debitMap),
    credits: toAssetAmounts(creditMap),
    feeCharged: String(feeCharged)
  };
}

function accumulate(map: Map<string, Accumulator>, asset: ReceiptAsset, amount: string): void {
  const key = assetKey(asset);
  const existing = map.get(key);
  const stroops = toStroops(amount);

  if (existing) {
    existing.stroops += stroops;
  } else {
    map.set(key, { asset, stroops });
  }
}

function toAssetAmounts(map: Map<string, Accumulator>): AssetAmount[] {
  return [...map.values()].map(({ asset, stroops }) => ({
    asset,
    amount: stroopsToAmount(stroops)
  }));
}

/** Inverse of `toStroops` — restores a 7-decimal amount string. */
export function stroopsToAmount(stroops: bigint): string {
  const negative = stroops < 0n;
  const magnitude = negative ? -stroops : stroops;
  const whole = magnitude / 10_000_000n;
  const fraction = (magnitude % 10_000_000n).toString().padStart(7, "0").replace(/0+$/, "");
  const body = fraction ? `${whole}.${fraction}` : String(whole);
  return negative ? `-${body}` : body;
}
