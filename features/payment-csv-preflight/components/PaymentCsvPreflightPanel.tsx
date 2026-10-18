"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy, errorCopy } from "@/features/payment-csv-preflight/copy";
import { PaymentCsvPreflightEmptyState } from "@/features/payment-csv-preflight/components/PaymentCsvPreflightEmptyState";
import { PaymentCsvPreflightForm } from "@/features/payment-csv-preflight/components/PaymentCsvPreflightForm";
import { PaymentCsvPreflightResult } from "@/features/payment-csv-preflight/components/PaymentCsvPreflightResult";
import { usePaymentCsvPreflight } from "@/features/payment-csv-preflight/hooks/usePaymentCsvPreflight";
import { describeError } from "@/features/payment-csv-preflight/lib/format";

export function PaymentCsvPreflightPanel() {
  const { state, submitText, submitFile, reset } = usePaymentCsvPreflight();

  return (
    <div className="space-y-5">
      <Card>
        <PaymentCsvPreflightForm
          onSubmitText={submitText}
          onSubmitFile={submitFile}
          onReset={reset}
          busy={state.status === "loading"}
        />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <StatusMessage
            type="info"
            title={copy.loadingTitle}
            description={copy.loadingDescription}
          />
          <SkeletonRows rows={4} className="mt-4" />
        </Card>
      ) : null}

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={describeError(state.code, state.detail)}
        />
      ) : null}

      {state.status === "success" ? (
        <PaymentCsvPreflightResult report={state.report} source={state.source} />
      ) : null}

      {state.status === "idle" ? <PaymentCsvPreflightEmptyState /> : null}
    </div>
  );
}
