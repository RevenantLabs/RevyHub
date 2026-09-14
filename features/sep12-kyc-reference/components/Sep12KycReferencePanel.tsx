"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useSep12KycReference } from "@/features/sep12-kyc-reference/hooks/useSep12KycReference";
import { copy, errorCopy } from "@/features/sep12-kyc-reference/copy";
import { Sep12KycReferenceForm } from "@/features/sep12-kyc-reference/components/Sep12KycReferenceForm";
import { Sep12KycReferenceResult } from "@/features/sep12-kyc-reference/components/Sep12KycReferenceResult";
import { Sep12KycReferenceEmptyState } from "@/features/sep12-kyc-reference/components/Sep12KycReferenceEmptyState";

export function Sep12KycReferencePanel() {
  const { state, search } = useSep12KycReference();

  return (
    <div className="space-y-5">
      <Card>
        <Sep12KycReferenceForm onSubmit={search} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <Sep12KycReferenceResult results={state.results} />
      ) : null}

      {state.status === "idle" ? <Sep12KycReferenceEmptyState /> : null}
    </div>
  );
}
