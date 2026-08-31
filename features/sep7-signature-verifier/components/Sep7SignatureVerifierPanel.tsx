"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useSep7SignatureVerifier } from "@/features/sep7-signature-verifier/hooks/useSep7SignatureVerifier";
import { errorCopy } from "@/features/sep7-signature-verifier/copy";
import { copy } from "@/features/sep7-signature-verifier/copy";
import { Sep7SignatureVerifierForm } from "@/features/sep7-signature-verifier/components/Sep7SignatureVerifierForm";
import { Sep7SignatureVerifierResult } from "@/features/sep7-signature-verifier/components/Sep7SignatureVerifierResult";
import { Sep7SignatureVerifierEmptyState } from "@/features/sep7-signature-verifier/components/Sep7SignatureVerifierEmptyState";

export function Sep7SignatureVerifierPanel() {
  const { state, submit } = useSep7SignatureVerifier();

  return (
    <div className="space-y-5">
      <Card>
        <Sep7SignatureVerifierForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "loading" ? <Card><p className="sr-only" role="status">{copy.loading}</p><SkeletonRows rows={2} /></Card> : null}

      {state.status === "success" ? <Sep7SignatureVerifierResult result={state.result} /> : null}

      {state.status === "idle" ? <Sep7SignatureVerifierEmptyState /> : null}
    </div>
  );
}
