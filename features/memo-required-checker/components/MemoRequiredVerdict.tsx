import { copy } from "@/features/memo-required-checker/copy";
import { formatVerdict } from "@/features/memo-required-checker/lib/format";
import type { MemoRequiredCheckerResult } from "@/features/memo-required-checker/types";

export function MemoRequiredVerdict({ result }: { result: MemoRequiredCheckerResult }) {
  return (
    <div>
      <p className="text-sm font-medium">{formatVerdict(result.verdict)}</p>
      {result.conflict ? <p className="mt-1 text-sm text-white/60">{copy.conflictNote}</p> : null}
    </div>
  );
}
