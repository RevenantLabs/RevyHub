"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { usePaymentMemoPolicyChecker } from "@/features/payment-memo-policy-checker/hooks/usePaymentMemoPolicyChecker";
import { errorCopy } from "@/features/payment-memo-policy-checker/copy";
import { PaymentMemoPolicyCheckerForm } from "@/features/payment-memo-policy-checker/components/PaymentMemoPolicyCheckerForm";
import { PaymentMemoPolicyCheckerResult } from "@/features/payment-memo-policy-checker/components/PaymentMemoPolicyCheckerResult";
import { PaymentMemoPolicyCheckerEmptyState } from "@/features/payment-memo-policy-checker/components/PaymentMemoPolicyCheckerEmptyState";

export function PaymentMemoPolicyCheckerPanel() {
  const { state, submit } = usePaymentMemoPolicyChecker();

  return (
    <div className="space-y-5">
      <Card>
        <PaymentMemoPolicyCheckerForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <PaymentMemoPolicyCheckerResult result={state.result} /> : null}

      {state.status === "idle" ? <PaymentMemoPolicyCheckerEmptyState /> : null}
    </div>
  );
}
