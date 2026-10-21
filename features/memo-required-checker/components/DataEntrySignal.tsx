import { copy } from "@/features/memo-required-checker/copy";
import { formatSignal } from "@/features/memo-required-checker/lib/format";
import type { MemoSignal } from "@/features/memo-required-checker/types";

export function DataEntrySignal({ signal }: { signal: MemoSignal }) {
  return (
    <p>
      <span className="text-sm text-white/55">{copy.dataEntryTitle}: </span>
      <span className="text-sm">{formatSignal(signal)}</span>
    </p>
  );
}
