import { copy } from "../copy";
import { formatMismatch } from "../lib/format";
import type { Mismatch } from "../types";

export function MismatchTree({ mismatches }: { mismatches: Mismatch[] }) {
  if (!mismatches.length) return <p role="status">{copy.noMismatches}</p>;
  return (
    <ul aria-label={copy.mismatchTitle}>
      {mismatches.map((item) => (
        <li key={`${item.path}:${item.actual}`}>{formatMismatch(item.path, item.expected, item.actual)}</li>
      ))}
    </ul>
  );
}
