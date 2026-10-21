import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/regulated-asset-inspector/copy";
import { formatFlag, formatOptional } from "@/features/regulated-asset-inspector/lib/format";
import type { RegulatedAssetInspectorResult as ResultValue } from "@/features/regulated-asset-inspector/types";
import { ApprovalCriteriaText } from "@/features/regulated-asset-inspector/components/ApprovalCriteriaText";
import { ApprovalServerInfo } from "@/features/regulated-asset-inspector/components/ApprovalServerInfo";
import { RegulatedBadge } from "@/features/regulated-asset-inspector/components/RegulatedBadge";

export function RegulatedAssetInspectorResult({ result }: { result: ResultValue }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.resultTitle}</CardTitle>
      </CardHeader>
      <p className="text-sm font-medium">{copy.selfPublishedTitle}</p>
      <p className="mt-1 text-sm text-white/60">{result.selfPublishedNotice}</p>
      <p className="mt-1 text-sm text-white/60">{copy.selfPublishedDescription}</p>
      <div className="mt-4 space-y-4">
        <RegulatedBadge result={result} />
        <ApprovalServerInfo value={formatOptional(result.approvalServer)} />
        <ApprovalCriteriaText value={formatOptional(result.approvalCriteria)} />
        <DataList
          items={[
            { label: copy.homeDomainLabel, value: result.homeDomain },
            { label: copy.tomlUrlLabel, value: result.tomlUrl }
          ]}
        />
        <section aria-labelledby="issuer-flags-heading">
          <h3 id="issuer-flags-heading" className="text-sm font-semibold">
            {copy.flagsTitle}
          </h3>
          <p className="mt-1 text-xs text-white/55">{copy.flagsHint}</p>
          <DataList
            items={[
              { label: "auth_required", value: formatFlag(result.issuerFlags.authRequired) },
              { label: "auth_revocable", value: formatFlag(result.issuerFlags.authRevocable) },
              { label: "auth_immutable", value: formatFlag(result.issuerFlags.authImmutable) },
              { label: "auth_clawback_enabled", value: formatFlag(result.issuerFlags.authClawbackEnabled) }
            ]}
          />
        </section>
      </div>
    </Card>
  );
}
