import { Receipt } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/payment-receipt-reconciler/copy";

export function PaymentReceiptReconcilerEmptyState() {
  return (
    <EmptyState icon={Receipt} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
