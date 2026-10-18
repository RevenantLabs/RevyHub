import type { AssetTotal, RoutedPayment, RoutingGroup } from "@/features/muxed-payment-routing-audit/types";
import { amountToStroops, formatStroops } from "@/features/muxed-payment-routing-audit/lib/format";
/** Group by destination ID, then by both asset code and issuer. */
export function routingTotals(payments: RoutedPayment[]): RoutingGroup[] {
  const groups = new Map<string | null, RoutedPayment[]>();
  for (const payment of payments) groups.set(payment.destinationId, [...(groups.get(payment.destinationId) ?? []), payment]);
  return [...groups].sort(([a], [b]) => a === null ? -1 : b === null ? 1 : BigInt(a) < BigInt(b) ? -1 : BigInt(a) > BigInt(b) ? 1 : 0).map(([destinationId, rows]) => {
    const assets = new Map<string, AssetTotal>();
    for (const row of rows) {
      const key = JSON.stringify([row.assetCode, row.assetIssuer]);
      const previous = assets.get(key);
      const sum = (previous ? amountToStroops(previous.amount)! : 0n) + amountToStroops(row.amount)!;
      assets.set(key, { assetCode: row.assetCode, assetIssuer: row.assetIssuer, amount: formatStroops(sum) });
    }
    return { destinationId, payments: rows, totals: [...assets.values()] };
  });
}
