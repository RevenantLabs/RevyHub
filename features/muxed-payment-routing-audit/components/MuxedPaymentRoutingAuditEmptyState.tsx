import { ListFilter } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/muxed-payment-routing-audit/copy";
export function MuxedPaymentRoutingAuditEmptyState() { return <EmptyState icon={ListFilter} title={copy.emptyTitle} description={copy.emptyDescription} />; }
