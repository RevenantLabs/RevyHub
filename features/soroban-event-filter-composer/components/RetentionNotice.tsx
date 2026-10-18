import { copy } from "../copy";
import { formatLedgerPair } from "../lib/format";

export function RetentionNotice({ oldestLedger, latestLedger, truncated }: { oldestLedger: string; latestLedger: string; truncated: boolean }) {
  return (
    <aside>
      <p>{copy.retentionTitle}</p>
      <p>{copy.labels.oldestLedger}: {formatLedgerPair(oldestLedger, latestLedger)}</p>
      {truncated ? <p role="status">{copy.truncated}</p> : null}
    </aside>
  );
}
