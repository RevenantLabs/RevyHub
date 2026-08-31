import { QrCode } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/payment-qr/copy";

export function PaymentQrEmptyState() {
  return <EmptyState icon={QrCode} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
