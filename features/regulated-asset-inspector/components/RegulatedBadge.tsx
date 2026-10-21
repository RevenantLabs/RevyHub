import { copy } from "@/features/regulated-asset-inspector/copy";
import type { RegulatedAssetInspectorResult } from "@/features/regulated-asset-inspector/types";

export function RegulatedBadge({ result }: { result: RegulatedAssetInspectorResult }) {
  const label = result.regulatedStatus === "regulated" ? copy.regulatedLabel : copy.notRegulatedLabel;
  return (
    <p>
      <span className="text-sm font-medium">{label}</span>
      {!result.regulatedFieldPresent ? (
        <span className="mt-1 block text-sm text-white/60">{copy.omittedFieldNote}</span>
      ) : null}
    </p>
  );
}
