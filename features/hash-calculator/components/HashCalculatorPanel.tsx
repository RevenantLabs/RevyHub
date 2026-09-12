"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { copy, errorCopy } from "@/features/hash-calculator/copy";
import { HashCalculatorEmptyState } from "@/features/hash-calculator/components/HashCalculatorEmptyState";
import { HashCalculatorForm } from "@/features/hash-calculator/components/HashCalculatorForm";
import { HashCalculatorResult } from "@/features/hash-calculator/components/HashCalculatorResult";
import { useHashCalculator } from "@/features/hash-calculator/hooks/useHashCalculator";

/** Panel component orchestrating the hash calculator views and state. */
export function HashCalculatorPanel() {
  const { state, submit, switchPassphrase } = useHashCalculator();
  const error = state.status === "error" ? state : null;

  return (
    <div className="space-y-5">
      <Card>
        <HashCalculatorForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {error ? (
        <StatusMessage
          type="error"
          title={errorCopy[error.code].title}
          description={errorCopy[error.code].description}
        />
      ) : null}

      {state.status === "loading" ? (
        <Card>
          <p className="sr-only" role="status">
            {copy.submitting}
          </p>
          <SkeletonRows rows={3} />
        </Card>
      ) : null}

      {state.status === "success" ? (
        <HashCalculatorResult
          result={state.result}
          onSwitchPassphrase={switchPassphrase}
        />
      ) : null}

      {state.status === "idle" ? <HashCalculatorEmptyState /> : null}
    </div>
  );
}
