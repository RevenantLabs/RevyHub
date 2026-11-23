import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/transaction-sequence-gap-auditor/copy";
import {
  formatNetwork,
  formatSequence
} from "@/features/transaction-sequence-gap-auditor/lib/format";
import type { HistoryCoverage as Coverage } from "@/features/transaction-sequence-gap-auditor/types";

export function HistoryCoverage({ coverage }: { coverage: Coverage }) {
  return (
    <DataList
      items={[
        { label: copy.network, value: formatNetwork(coverage.network) },
        { label: copy.pages, value: String(coverage.pagesFetched) },
        { label: copy.transactions, value: String(coverage.transactionCount) },
        { label: copy.successful, value: String(coverage.successfulCount) },
        { label: copy.failed, value: String(coverage.failedCount) },
        {
          label: copy.oldest,
          value: coverage.oldestSequence ? formatSequence(coverage.oldestSequence) : "—"
        },
        {
          label: copy.newest,
          value: coverage.newestSequence ? formatSequence(coverage.newestSequence) : "—"
        },
        {
          label: copy.limitReached,
          value: coverage.limitReached ? copy.limitReachedValue : copy.limitNotReachedValue
        }
      ]}
    />
  );
}
