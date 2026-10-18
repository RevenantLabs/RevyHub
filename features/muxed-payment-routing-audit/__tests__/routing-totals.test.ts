import { describe, expect, it } from "vitest";
import { routingTotals } from "@/features/muxed-payment-routing-audit/lib/routing-totals";
import type { RoutedPayment } from "@/features/muxed-payment-routing-audit/types";
const row = (destinationId: string | null, amount: string, assetIssuer: string | null): RoutedPayment => ({ pagingToken: `${destinationId}:${amount}:${assetIssuer}`, createdAt: "2026-09-28T08:00:00Z", transactionHash: "a", destinationId, amount, assetCode: assetIssuer ? "USD" : "XLM", assetIssuer });
describe("routing totals", () => {
  it("keeps direct, IDs, and issuers separate while adding exact stroops", () => {
    const groups = routingTotals([row("7", "9007199254740993.0000001", "issuer A"), row("7", "0.0000001", "issuer A"), row("7", "2", "issuer B"), row(null, "3", null), row("9", "4", null)]);
    expect(groups.map((g) => g.destinationId)).toEqual([null, "7", "9"]);
    expect(groups[1].totals).toEqual([{ assetCode: "USD", assetIssuer: "issuer A", amount: "9007199254740993.0000002" }, { assetCode: "USD", assetIssuer: "issuer B", amount: "2" }]);
  });
});
