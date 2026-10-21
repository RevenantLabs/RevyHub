"use client";

import { Card } from "@/core/ui/Card";
import { SkeletonRows } from "@/core/ui/Skeleton";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useTxrepConverter } from "@/features/txrep-converter/hooks/useTxrepConverter";
import { copy, errorCopy } from "@/features/txrep-converter/copy";
import { TxrepConverterForm } from "@/features/txrep-converter/components/TxrepConverterForm";
import { TxrepConverterResult } from "@/features/txrep-converter/components/TxrepConverterResult";
import { TxrepConverterEmptyState } from "@/features/txrep-converter/components/TxrepConverterEmptyState";

export function TxrepConverterPanel() {
  const { state, submit } = useTxrepConverter();

  return (
    <div className="space-y-5">
      <Card>
        <TxrepConverterForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>
      {state.status === "loading" ? (
        <Card>
          <p className="sr-only" role="status">
            {copy.loading}
          </p>
          <SkeletonRows rows={3} />
        </Card>
      ) : null}
      {state.status === "error" ? (
        <StatusMessage type="error" title={errorCopy[state.code].title} description={errorCopy[state.code].description} />
      ) : null}
      {state.status === "success" ? <TxrepConverterResult result={state.result} /> : null}
      {state.status === "idle" ? <TxrepConverterEmptyState /> : null}
    </div>
  );
}
