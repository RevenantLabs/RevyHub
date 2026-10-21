"use client";

import { Card, StatusMessage } from "@/core/ui";
import { copy, errorCopy } from "../copy";
import { useLiquidityPoolIdCalculator } from "../hooks/useLiquidityPoolIdCalculator";
import { LiquidityPoolIdCalculatorEmptyState } from "./LiquidityPoolIdCalculatorEmptyState";
import { LiquidityPoolIdCalculatorForm } from "./LiquidityPoolIdCalculatorForm";
import { LiquidityPoolIdCalculatorResult } from "./LiquidityPoolIdCalculatorResult";

export function LiquidityPoolIdCalculatorPanel() {
  const { state, submit, reset } = useLiquidityPoolIdCalculator();
  return (
    <div className="space-y-5">
      <p>{copy.description}</p>
      <Card>
        <LiquidityPoolIdCalculatorForm onSubmit={submit} onEdit={reset} />
      </Card>
      {state.status === "idle" ? <LiquidityPoolIdCalculatorEmptyState /> : null}
      {state.status === "error" ? <StatusMessage type="error" {...errorCopy[state.code]} /> : null}
      {state.status === "success" ? <LiquidityPoolIdCalculatorResult result={state.result} /> : null}
    </div>
  );
}
