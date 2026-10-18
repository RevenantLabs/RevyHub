"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { errorCopy } from "@/features/signature-hint-auditor/copy";
import { useSignatureHintAuditor } from "@/features/signature-hint-auditor/hooks/useSignatureHintAuditor";
import { SignatureHintAuditorForm } from "@/features/signature-hint-auditor/components/SignatureHintAuditorForm";
import { SignatureHintAuditorResult } from "@/features/signature-hint-auditor/components/SignatureHintAuditorResult";
import { SignatureHintAuditorEmptyState } from "@/features/signature-hint-auditor/components/SignatureHintAuditorEmptyState";
import { isUnsupportedEnvelope } from "@/features/signature-hint-auditor/lib/signatureHintAuditor.errors";

export function SignatureHintAuditorPanel() {
  const { state, submit, redactions } = useSignatureHintAuditor();

  return (
    <div className="space-y-5">
      <Card>
        {/*
          Keying on the redaction counter remounts the form when a secret key
          is refused, which clears the seed out of the textarea.
        */}
        <SignatureHintAuditorForm
          key={redactions}
          onSubmit={submit}
          pending={state.status === "loading"}
        />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <SkeletonRows rows={4} />
        </Card>
      ) : null}

      {state.status === "error" ? (
        <StatusMessage
          type={isUnsupportedEnvelope(state.code) ? "info" : "error"}
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <SignatureHintAuditorResult result={state.result} />
      ) : null}

      {state.status === "idle" ? <SignatureHintAuditorEmptyState /> : null}
    </div>
  );
}
