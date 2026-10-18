import { Badge } from "@/core/ui/Badge";
import { copy, verdictDescription, verdictLabel } from "@/features/claimable-balance-readiness/copy";
import type { ReadinessVerdictKind } from "@/features/claimable-balance-readiness/types";

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

/** Eligible / ineligible / indeterminate / not-listed verdict for the selected claimant. */
export function ReadinessVerdict({ verdict }: { verdict: ReadinessVerdictKind }) {
  return (
    <section
      aria-label={copy.resultTitle}
      className="rounded-md border border-[#e3ebf5] bg-white/70 px-4 py-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#4e5c73]">
          {copy.resultTitle}
        </h3>
        <Badge tone={toneFor(verdict)}>{verdictLabel(verdict)}</Badge>
      </div>
      <p className="mt-2 text-sm text-[#172033]" role="status">
        {verdictDescription(verdict)}
      </p>
    </section>
  );
}
