import { copy } from "@/features/muxed-payment-routing-audit/copy";
import { formatAsset, formatDate } from "@/features/muxed-payment-routing-audit/lib/format";
import type { RoutedPayment } from "@/features/muxed-payment-routing-audit/types";
export function PaymentRows({ payments }: { payments: RoutedPayment[] }) {
  return <div><h4 className="font-semibold">{copy.paymentRowsTitle}</h4><ul className="space-y-2">{payments.map((payment) => <li key={payment.pagingToken} className="rounded border p-2 text-sm">
    <span>{copy.paymentDate}: {formatDate(payment.createdAt)}</span>{" · "}<span>{copy.paymentAmount}: {payment.amount} {formatAsset(payment.assetCode, payment.assetIssuer)}</span><div className="break-all font-mono">{copy.paymentTransaction}: {payment.transactionHash}</div>
  </li>)}</ul></div>;
}
