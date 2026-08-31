"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useSignatureVerifier } from "@/features/signature-verifier/hooks/useSignatureVerifier";
import { errorCopy } from "@/features/signature-verifier/copy";
import { SignatureVerifierForm } from "@/features/signature-verifier/components/SignatureVerifierForm";
import { SignatureVerifierResult } from "@/features/signature-verifier/components/SignatureVerifierResult";
import { SignatureVerifierEmptyState } from "@/features/signature-verifier/components/SignatureVerifierEmptyState";

export function SignatureVerifierPanel() {
  const { state, submit } = useSignatureVerifier();

  return (
    <div className="space-y-5">
      <Card>
        <SignatureVerifierForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <SignatureVerifierResult result={state.result} /> : null}

      {state.status === "idle" ? <SignatureVerifierEmptyState /> : null}
    </div>
  );
}
