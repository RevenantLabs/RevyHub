"use client";

import { Badge } from "@/core/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { CodeBlock } from "@/core/ui/CodeBlock";
import { CopyableValue } from "@/core/ui/CopyableValue";
import { DataList } from "@/core/ui/DataList";
import { LockoutEvidence } from "@/features/signer-rotation-impact-auditor/components/LockoutEvidence";
import { RotationTimeline } from "@/features/signer-rotation-impact-auditor/components/RotationTimeline";
import { copy } from "@/features/signer-rotation-impact-auditor/copy";
import { toJsonSummary } from "@/features/signer-rotation-impact-auditor/lib/signerRotationImpactAuditor";
import {
  formatBoolean,
  formatThresholds,
  formatWeight
} from "@/features/signer-rotation-impact-auditor/lib/format";
import type { SignerRotationResult } from "@/features/signer-rotation-impact-auditor/types";

export function SignerRotationImpactAuditorResult({
  result
}: {
  result: SignerRotationResult;
}) {
  const json = toJsonSummary(result);
  const appliedCount = result.steps.filter((step) => step.appliesToSnapshot).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{copy.overviewTitle}</CardTitle>
          <CardDescription>{copy.advisoryNote}</CardDescription>
        </CardHeader>

        <DataList
          items={[
            {
              label: copy.labelAccount,
              value: <CopyableValue label={copy.labelAccount} value={result.accountId} />
            },
            {
              label: copy.labelEnvelopeKind,
              value: result.envelopeKind
            },
            {
              label: copy.labelInitialWeight,
              value: formatWeight(result.initialTotalWeight)
            },
            {
              label: copy.labelFinalWeight,
              value: formatWeight(result.finalTotalWeight)
            },
            {
              label: "Initial thresholds",
              value: formatThresholds(result.initialThresholds)
            },
            {
              label: "Final thresholds",
              value: formatThresholds(result.finalThresholds)
            },
            {
              label: copy.labelSteps,
              value: String(appliedCount)
            },
            {
              label: copy.labelPassphrase,
              value: result.networkPassphrase
            }
          ]}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.evidenceTitle}</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge tone={result.evidence.hasSigners ? "success" : "danger"}>
            {copy.evidenceSigners}: {formatBoolean(result.evidence.hasSigners)}
          </Badge>
          <Badge tone={result.evidence.hasThresholds ? "success" : "danger"}>
            {copy.evidenceThresholds}: {formatBoolean(result.evidence.hasThresholds)}
          </Badge>
          <Badge tone={result.evidence.hasSetOptions ? "success" : "warning"}>
            {copy.evidenceSetOptions}: {formatBoolean(result.evidence.hasSetOptions)}
          </Badge>
        </div>
      </Card>

      <LockoutEvidence
        lockout={result.lockout}
        finalReachability={result.finalReachability}
        evidenceComplete={result.evidence.complete}
      />

      <RotationTimeline steps={result.steps} impacts={result.impacts} />

      <Card>
        <CardHeader>
          <CardTitle>{copy.exportTitle}</CardTitle>
          <CardDescription>{copy.exportDescription}</CardDescription>
        </CardHeader>
        <div className="space-y-2">
          <CopyableValue label={copy.copyExport} value={json} visible={12} />
          <CodeBlock label="JSON">{json}</CodeBlock>
        </div>
      </Card>
    </div>
  );
}
