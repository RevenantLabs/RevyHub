"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useLiquidityPoolCalculator } from "@/features/liquidity-pool-calculator/hooks/useLiquidityPoolCalculator";
import { errorCopy } from "@/features/liquidity-pool-calculator/copy";
import { LiquidityPoolCalculatorForm } from "@/features/liquidity-pool-calculator/components/LiquidityPoolCalculatorForm";
import { LiquidityPoolCalculatorResult } from "@/features/liquidity-pool-calculator/components/LiquidityPoolCalculatorResult";
import { LiquidityPoolCalculatorEmptyState } from "@/features/liquidity-pool-calculator/components/LiquidityPoolCalculatorEmptyState";

export function LiquidityPoolCalculatorPanel() {
  const { state, submit } = useLiquidityPoolCalculator();

  return (
    <div className="space-y-5">
      <Card>
        <LiquidityPoolCalculatorForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <LiquidityPoolCalculatorResult result={state.result} /> : null}

      {state.status === "idle" ? <LiquidityPoolCalculatorEmptyState /> : null}
    </div>
  );
}
