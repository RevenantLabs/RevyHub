import { IdCard } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/sep12-fields/copy";

export function Sep12FieldsEmptyState() {
  return <EmptyState icon={IdCard} title={copy.emptyTitle} description={copy.emptyDescription} />;
}
