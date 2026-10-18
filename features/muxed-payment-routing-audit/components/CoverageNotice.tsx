import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy } from "@/features/muxed-payment-routing-audit/copy";
import type { MuxedPaymentRoutingAuditResult } from "@/features/muxed-payment-routing-audit/types";
export function CoverageNotice({ result }: { result: MuxedPaymentRoutingAuditResult }) {
  return <StatusMessage type="info" title={copy.coverageTitle} description={copy.coverage(result.pagesFetched, result.pageLimit, result.hasMore, result.scannedOperations)} />;
}
