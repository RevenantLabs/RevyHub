"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { usePaymentReceiptReconciler } from "@/features/payment-receipt-reconciler/hooks/usePaymentReceiptReconciler";
import { copy, errorCopy } from "@/features/payment-receipt-reconciler/copy";
import { PaymentReceiptReconcilerForm } from "@/features/payment-receipt-reconciler/components/PaymentReceiptReconcilerForm";
import { PaymentReceiptReconcilerResult } from "@/features/payment-receipt-reconciler/components/PaymentReceiptReconcilerResult";
import { PaymentReceiptReconcilerEmptyState } from "@/features/payment-receipt-reconciler/components/PaymentReceiptReconcilerEmptyState";

export function PaymentReceiptReconcilerPanel() {
  const { state, submit } = usePaymentReceiptReconciler();

  return (
    <div className="space-y-5">
      <Card>
        <PaymentReceiptReconcilerForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <p className="sr-only" role="status">
            {copy.loading}
          </p>
          <SkeletonRows rows={5} />
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
        <PaymentReceiptReconcilerResult result={state.result} />
      ) : null}

      {state.status === "idle" ? <PaymentReceiptReconcilerEmptyState /> : null}
    </div>
  );
}
