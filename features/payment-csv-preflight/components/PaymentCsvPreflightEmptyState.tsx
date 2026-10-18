import { FileSpreadsheet } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/payment-csv-preflight/copy";

export function PaymentCsvPreflightEmptyState() {
  return (
    <EmptyState
      icon={FileSpreadsheet}
      title={copy.emptyTitle}
      description={copy.emptyDescription}
    />
  );
}
