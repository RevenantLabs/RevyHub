import { Badge } from "@/core/ui/Badge";
import {
  copy,
  impactLabels,
  kindLabels,
  reasonLabels,
  statusLabels
} from "@/features/contract-upgrade-diff-report/copy";
import { changedFirst, formatSide, statusTone } from "@/features/contract-upgrade-diff-report/lib/format";
import type { DeclarationChange } from "@/features/contract-upgrade-diff-report/types";

function ChangeRow({ change }: { change: DeclarationChange }) {
  const visibleParts = change.parts.filter((part) => part.status !== "unchanged");

  return (
    <li className="space-y-2 rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-3 text-sm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-xs font-bold text-[#4e5c73]">{kindLabels[change.kind]}</span>
        <span className="break-all font-mono text-xs font-semibold text-[#172033]">{change.name}</span>
        <Badge tone={statusTone(change.status)}>{statusLabels[change.status]}</Badge>
        {change.status !== "unchanged" ? (
          <span className="text-xs text-[#4e5c73]">{impactLabels[change.impact]}</span>
        ) : null}
      </div>

      {change.reason ? <p className="text-xs text-[#146783]">{reasonLabels[change.reason]}</p> : null}

      <dl className="grid gap-1 sm:grid-cols-[minmax(0,5rem)_1fr] sm:gap-3">
        <dt className="text-xs font-bold text-[#4e5c73]">{copy.columnBefore}</dt>
        <dd className="min-w-0 break-words font-mono text-xs text-[#9f342d]">
          {formatSide(change.before?.signature ?? null)}
        </dd>
        <dt className="text-xs font-bold text-[#4e5c73]">{copy.columnAfter}</dt>
        <dd className="min-w-0 break-words font-mono text-xs text-[#17664b]">
          {formatSide(change.after?.signature ?? null)}
        </dd>
      </dl>

      {change.status === "changed" && visibleParts.length ? (
        <ul className="space-y-1 border-l-2 border-[#ffc3a8] pl-3">
          {visibleParts.map((part) => (
            <li key={part.label} className="text-xs text-[#172033]">
              <span className="font-bold">{part.label}</span> · {statusLabels[part.status]}:{" "}
              <span className="font-mono">{formatSide(part.before)}</span> →{" "}
              <span className="font-mono">{formatSide(part.after)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/**
 * Old/new declarations, most consequential first: removed, changed, unknown,
 * added, then unchanged. Every value is rendered as inert text.
 */
export function InterfaceChangeRows({
  changes,
  specUnavailable
}: {
  changes: DeclarationChange[];
  /** True when either specification is missing, so an empty list is not a valid empty result. */
  specUnavailable: boolean;
}) {
  if (!changes.length) {
    return (
      <p className="text-sm text-[#4e5c73]">
        {specUnavailable ? reasonLabels.spec_unavailable : copy.declarationsEmpty}
      </p>
    );
  }

  return (
    <ol className="space-y-2">
      {changedFirst(changes).map((change) => (
        <ChangeRow key={`${change.kind}:${change.name}`} change={change} />
      ))}
    </ol>
  );
}
