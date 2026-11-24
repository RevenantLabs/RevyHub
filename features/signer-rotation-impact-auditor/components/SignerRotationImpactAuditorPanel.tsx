"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { errorCopy, copy } from "@/features/signer-rotation-impact-auditor/copy";
import { useSignerRotationImpactAuditor } from "@/features/signer-rotation-impact-auditor/hooks/useSignerRotationImpactAuditor";
import { SignerRotationImpactAuditorForm } from "@/features/signer-rotation-impact-auditor/components/SignerRotationImpactAuditorForm";
import { SignerRotationImpactAuditorResult } from "@/features/signer-rotation-impact-auditor/components/SignerRotationImpactAuditorResult";
import { SignerRotationImpactAuditorEmptyState } from "@/features/signer-rotation-impact-auditor/components/SignerRotationImpactAuditorEmptyState";

export function SignerRotationImpactAuditorPanel() {
  const { state, submit, redactions } = useSignerRotationImpactAuditor();

  return (
    <div className="space-y-5">
      <Card>
        {/*
          Keying on the redaction counter remounts the form when a secret key
          is refused, which is what actually clears it out of the field.
        */}
        <SignerRotationImpactAuditorForm key={redactions} onSubmit={submit} />
      </Card>

      {state.status === "loading" ? (
        <Card aria-busy="true" aria-label={copy.loadingLabel}>
          <SkeletonRows rows={4} />
        </Card>
      ) : null}

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <SignerRotationImpactAuditorResult result={state.result} />
      ) : null}

      {state.status === "idle" ? <SignerRotationImpactAuditorEmptyState /> : null}
    </div>
  );
}
