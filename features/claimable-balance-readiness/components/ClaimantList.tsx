import { Badge } from "@/core/ui/Badge";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { copy, verdictLabel } from "@/features/claimable-balance-readiness/copy";
import type { ClaimantSummary, ReadinessVerdictKind } from "@/features/claimable-balance-readiness/types";

function toneFor(
  kind: ReadinessVerdictKind
): "success" | "danger" | "warning" | "muted" {
  switch (kind) {
    case "eligible":
      return "success";
    case "ineligible":
      return "danger";
    case "indeterminate":
      return "warning";
    case "not_listed":
      return "muted";
  }
}

/** Lists every claimant on the balance and highlights the selected one. */
export function ClaimantList({ claimants }: { claimants: ClaimantSummary[] }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-[#4e5c73]">
        {copy.claimantsTitle}
      </h3>
      <ol className="space-y-3" aria-label={copy.claimantsTitle}>
        {claimants.map((claimant) => (
          <li
            key={claimant.destination}
            className="rounded-md border border-[#e3ebf5] bg-white/60 px-3 py-3 text-sm"
            aria-current={claimant.selected ? "true" : undefined}
          >
            <div className="flex flex-wrap items-center gap-2">
              <CopyableValue label="claimant" value={claimant.destination} visible={4} />
              <Badge tone={toneFor(claimant.verdict)}>{verdictLabel(claimant.verdict)}</Badge>
              {claimant.selected ? (
                <Badge tone="info">{copy.selectedBadge}</Badge>
              ) : null}
            </div>
            {claimant.predicateTree ? (
              <p className="mt-2 text-[#172033]">{claimant.predicateTree.label}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
