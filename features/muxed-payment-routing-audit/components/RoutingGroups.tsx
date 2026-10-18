import { copy } from "@/features/muxed-payment-routing-audit/copy";
import { formatAsset } from "@/features/muxed-payment-routing-audit/lib/format";
import { PaymentRows } from "@/features/muxed-payment-routing-audit/components/PaymentRows";
import type { RoutingGroup } from "@/features/muxed-payment-routing-audit/types";
export function RoutingGroups({ groups }: { groups: RoutingGroup[] }) {
  return <div className="space-y-5">{groups.map((group) => <section key={group.destinationId ?? "direct"} className="rounded-lg border p-4 space-y-3">
    <h3 className="font-bold break-all">{group.destinationId === null ? copy.directGroup : copy.muxedGroup(group.destinationId)}</h3>
    <p>{copy.paymentCount(group.payments.length)}</p>
    <div><h4 className="font-semibold">{copy.totalsTitle}</h4><ul>{group.totals.map((total) => <li key={`${total.assetCode}:${total.assetIssuer ?? "native"}`} className="break-all">{total.amount} {formatAsset(total.assetCode, total.assetIssuer)}</li>)}</ul></div>
    <PaymentRows payments={group.payments} />
  </section>)}</div>;
}
