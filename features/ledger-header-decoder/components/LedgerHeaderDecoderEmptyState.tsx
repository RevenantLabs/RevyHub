import { FileCode2 } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/ledger-header-decoder/copy";

export function LedgerHeaderDecoderEmptyState() {
  return <EmptyState icon={FileCode2} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
