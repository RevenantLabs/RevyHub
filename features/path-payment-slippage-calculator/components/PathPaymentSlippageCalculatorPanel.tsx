"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { usePathPaymentSlippageCalculator } from "@/features/path-payment-slippage-calculator/hooks/usePathPaymentSlippageCalculator";
import { errorCopy } from "@/features/path-payment-slippage-calculator/copy";
import { PathPaymentSlippageCalculatorForm } from "@/features/path-payment-slippage-calculator/components/PathPaymentSlippageCalculatorForm";
import { PathPaymentSlippageCalculatorResult } from "@/features/path-payment-slippage-calculator/components/PathPaymentSlippageCalculatorResult";
import { PathPaymentSlippageCalculatorEmptyState } from "@/features/path-payment-slippage-calculator/components/PathPaymentSlippageCalculatorEmptyState";

export function PathPaymentSlippageCalculatorPanel() {
  const { state, submit } = usePathPaymentSlippageCalculator();

  return (
    <div className="space-y-5">
      <Card>
        <PathPaymentSlippageCalculatorForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <PathPaymentSlippageCalculatorResult result={state.result} /> : null}

      {state.status === "idle" ? <PathPaymentSlippageCalculatorEmptyState /> : null}
    </div>
  );
}
