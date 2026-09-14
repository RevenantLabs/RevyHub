import { Card } from "@/core/ui/Card";
import { copy } from "@/features/horizon-pagination-inspector/copy";
import { formatBoolean, formatCount, formatCursor } from "@/features/horizon-pagination-inspector/lib/format";
import type { HorizonPageInfo } from "@/features/horizon-pagination-inspector/types";

interface Props {
  result: HorizonPageInfo;
}

export function HorizonPaginationInspectorResult({ result }: Props) {
  return (
    <Card>
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-[#172033]">{copy.resultTitle}</h3>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-[#68758a]">
              {copy.recordsLabel}
            </span>
            <p className="mt-0.5 text-[#172033]">{formatCount(result.records)}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-[#68758a]">
              {copy.hasNextLabel}
            </span>
            <p className="mt-0.5 text-[#172033]">{formatBoolean(result.hasNextPage)}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-[#68758a]">
              {copy.nextCursorLabel}
            </span>
            <p className="mt-0.5 text-[#172033] font-mono text-xs">{formatCursor(result.nextCursor)}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-[#68758a]">
              {copy.prevCursorLabel}
            </span>
            <p className="mt-0.5 text-[#172033] font-mono text-xs">{formatCursor(result.prevCursor)}</p>
          </div>
          <div className="col-span-2">
            <span className="text-xs font-medium uppercase tracking-wide text-[#68758a]">
              {copy.selfHrefLabel}
            </span>
            <p className="mt-0.5 text-[#172033] font-mono text-xs break-all">{result.selfHref || "—"}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
