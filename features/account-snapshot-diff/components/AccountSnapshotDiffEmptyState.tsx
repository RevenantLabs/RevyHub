import { Diff } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { copy } from "@/features/account-snapshot-diff/copy";

export function AccountSnapshotDiffEmptyState() {
  return (
    <EmptyState icon={Diff} title={copy.emptyTitle} description={copy.emptyDescription} />
  );
}
