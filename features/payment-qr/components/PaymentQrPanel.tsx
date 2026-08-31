"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { usePaymentQr } from "@/features/payment-qr/hooks/usePaymentQr";
import { errorCopy } from "@/features/payment-qr/copy";
import { PaymentQrForm } from "@/features/payment-qr/components/PaymentQrForm";
import { PaymentQrResult } from "@/features/payment-qr/components/PaymentQrResult";
import { PaymentQrEmptyState } from "@/features/payment-qr/components/PaymentQrEmptyState";

export function PaymentQrPanel() {
  const { state, submit } = usePaymentQr();
  const error = state.status === "error" ? state : null;

  return (
    <div className="space-y-5">
      <Card>
        <PaymentQrForm
          onSubmit={submit}
          pending={state.status === "generating"}
          errorField={error?.field ?? null}
          errorMessage={error ? errorCopy[error.code].title : null}
        />
      </Card>

      {error && !error.field ? (
        <StatusMessage
          type="error"
          title={errorCopy[error.code].title}
          description={errorCopy[error.code].description}
        />
      ) : null}

      {state.status === "success" ? (
        <PaymentQrResult request={state.request} result={state.result} />
      ) : null}

      {state.status === "idle" ? <PaymentQrEmptyState /> : null}
    </div>
  );
}
