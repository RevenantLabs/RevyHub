"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useAmountConverter } from "@/features/amount-converter/hooks/useAmountConverter";
import { errorCopy } from "@/features/amount-converter/copy";
import { AmountConverterForm } from "@/features/amount-converter/components/AmountConverterForm";
import { AmountConverterResult } from "@/features/amount-converter/components/AmountConverterResult";
import { AmountConverterEmptyState } from "@/features/amount-converter/components/AmountConverterEmptyState";

export function AmountConverterPanel() {
  const { stroops, amount, state, updateStroops, updateAmount, loadMaxExample, reset } =
    useAmountConverter();

  const errorField = state.status === "error" ? state.field : null;
  const errorCode = state.status === "error" ? state.code : null;

  return (
    <div className="space-y-5">
      <Card>
        <AmountConverterForm
          stroops={stroops}
          amount={amount}
          errorField={errorField}
          errorCode={errorCode}
          onStroopsChange={updateStroops}
          onAmountChange={updateAmount}
          onLoadMaxExample={loadMaxExample}
          onReset={reset}
        />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "result" ? <AmountConverterResult result={state.result} /> : null}

      {state.status === "idle" ? <AmountConverterEmptyState /> : null}
    </div>
  );
}
