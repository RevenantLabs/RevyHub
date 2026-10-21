import { StatusMessage } from "@/core/ui";
import { copy } from "../copy";
import { formatVerdictLabel } from "../lib/format";
import type { EligibilityVerdict as EligibilityVerdictValue } from "../types";

const STATUS_TYPE: Record<EligibilityVerdictValue["kind"], "success" | "warning" | "info"> = {
  eligible: "warning",
  not_eligible: "success",
  disagreement: "warning",
  unknown: "info"
};

export function EligibilityVerdict({ verdict }: { verdict: EligibilityVerdictValue }) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-bold text-[#4e5c73]">{copy.verdictTitle}</h3>
      <StatusMessage
        type={STATUS_TYPE[verdict.kind]}
        title={formatVerdictLabel(verdict)}
        description={verdict.kind === "disagreement" ? copy.disagreementNote : undefined}
      />
    </div>
  );
}
