import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { copy } from "@/features/muxed-payment-routing-audit/copy";
import { CoverageNotice } from "@/features/muxed-payment-routing-audit/components/CoverageNotice";
import { RoutingGroups } from "@/features/muxed-payment-routing-audit/components/RoutingGroups";
import type { MuxedPaymentRoutingAuditResult as Result } from "@/features/muxed-payment-routing-audit/types";
export function MuxedPaymentRoutingAuditResult({ result }: { result: Result }) {
  return <div className="space-y-4"><CoverageNotice result={result} /><Card><CardHeader><CardTitle>{copy.resultTitle}</CardTitle></CardHeader>{result.groups.length ? <RoutingGroups groups={result.groups} /> : <p>{copy.noPayments}</p>}</Card></div>;
}
