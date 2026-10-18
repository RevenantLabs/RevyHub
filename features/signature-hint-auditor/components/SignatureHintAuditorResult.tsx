import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy, groupLabels } from "@/features/signature-hint-auditor/copy";
import { CandidateRows } from "@/features/signature-hint-auditor/components/CandidateRows";
import { CollisionNotice } from "@/features/signature-hint-auditor/components/CollisionNotice";
import { SignatureRows } from "@/features/signature-hint-auditor/components/SignatureRows";
import {
  formatEnvelopeVariant,
  formatSignatureCount
} from "@/features/signature-hint-auditor/lib/format";
import type { SignatureHintAuditorResult as ResultValue } from "@/features/signature-hint-auditor/types";

export function SignatureHintAuditorResult({ result }: { result: ResultValue }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{copy.resultTitle}</CardTitle>
          <CardDescription>{copy.resultDescription}</CardDescription>
        </CardHeader>
        <DataList
          items={[
            { label: copy.labelVariant, value: formatEnvelopeVariant(result.variant) },
            {
              label: copy.labelSignatureCount,
              value: formatSignatureCount(result.signatureCount)
            },
            {
              label: copy.labelProvidedSigners,
              value: String(result.providedSigners.length)
            },
            { label: copy.labelCollisions, value: String(result.collisionCount) },
            { label: copy.labelUnmatched, value: String(result.unmatchedCount) }
          ]}
        />
        <p className="mt-4 text-xs leading-5 text-[#68758a]">{copy.disclaimer}</p>
        <p className="mt-2 text-xs leading-5 text-[#68758a]">{copy.memoryNote}</p>
      </Card>

      <CollisionNotice
        collisionCount={result.collisionCount}
        unmatchedCount={result.unmatchedCount}
      />

      <Card>
        <CardHeader>
          <CardTitle>{copy.groupsTitle}</CardTitle>
        </CardHeader>
        <div className="space-y-6">
          {result.groups.map((group) => (
            <SignatureRows
              key={group.group}
              groupTitle={groupLabels[group.group]}
              signatures={group.signatures}
            />
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.candidatesTitle}</CardTitle>
        </CardHeader>
        <CandidateRows signers={result.providedSigners} />
      </Card>
    </div>
  );
}
