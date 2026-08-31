"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useLiquidityPoolInspector } from "@/features/liquidity-pool-inspector/hooks/useLiquidityPoolInspector";
import { copy, errorCopy } from "@/features/liquidity-pool-inspector/copy";
import { LiquidityPoolInspectorForm } from "@/features/liquidity-pool-inspector/components/LiquidityPoolInspectorForm";
import { LiquidityPoolInspectorResult } from "@/features/liquidity-pool-inspector/components/LiquidityPoolInspectorResult";
import { LiquidityPoolInspectorEmptyState } from "@/features/liquidity-pool-inspector/components/LiquidityPoolInspectorEmptyState";

export function LiquidityPoolInspectorPanel() {
  const { state, submit } = useLiquidityPoolInspector();

  return (
    <div className="space-y-5">
      <Card>
        <LiquidityPoolInspectorForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "loading" ? (
        <Card>
          <p className="sr-only" role="status">
            {copy.loading}
          </p>
          <SkeletonRows rows={4} />
        </Card>
      ) : null}

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <LiquidityPoolInspectorResult result={state.result} /> : null}

      {state.status === "idle" ? <LiquidityPoolInspectorEmptyState /> : null}
    </div>
  );
}
