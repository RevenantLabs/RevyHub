"use client";

import { Card, CardHeader, CardTitle } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { AccessChanges } from "@/features/soroban-footprint-diff/components/AccessChanges";
import { FootprintGroups } from "@/features/soroban-footprint-diff/components/FootprintGroups";
import { ResourceSummary } from "@/features/soroban-footprint-diff/components/ResourceSummary";
import { copy } from "@/features/soroban-footprint-diff/copy";
import { formatSummary } from "@/features/soroban-footprint-diff/lib/format";
import type { SorobanFootprintDiffResult } from "@/features/soroban-footprint-diff/types";

export function SorobanFootprintDiffResultView({
  result
}: {
  result: SorobanFootprintDiffResult;
}) {
  return (
    <div className="space-y-4">
      <StatusMessage
        type="info"
        title={copy.resultTitle}
        description={formatSummary({
          added: result.added.length,
          removed: result.removed.length,
          modeChanges: result.modeChanges.length
        })}
      />
      <p className="text-sm text-[#68758a]">{result.disclaimer}</p>

      <Card>
        <FootprintGroups added={result.added} removed={result.removed} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.modeTitle}</CardTitle>
        </CardHeader>
        <AccessChanges changes={result.modeChanges} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.resourcesTitle}</CardTitle>
        </CardHeader>
        <ResourceSummary first={result.firstResources} second={result.secondResources} />
      </Card>
    </div>
  );
}
