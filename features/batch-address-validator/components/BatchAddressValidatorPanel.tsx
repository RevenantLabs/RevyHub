"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useBatchAddressValidator } from "@/features/batch-address-validator/hooks/useBatchAddressValidator";
import { errorCopy } from "@/features/batch-address-validator/copy";
import { BatchAddressValidatorForm } from "@/features/batch-address-validator/components/BatchAddressValidatorForm";
import { BatchAddressValidatorResult } from "@/features/batch-address-validator/components/BatchAddressValidatorResult";
import { BatchAddressValidatorEmptyState } from "@/features/batch-address-validator/components/BatchAddressValidatorEmptyState";

export function BatchAddressValidatorPanel() {
  const { state, submit } = useBatchAddressValidator();

  return (
    <div className="space-y-5">
      <Card>
        <BatchAddressValidatorForm onSubmit={submit} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "result" ? <BatchAddressValidatorResult result={state.result} /> : null}

      {state.status === "idle" ? <BatchAddressValidatorEmptyState /> : null}
    </div>
  );
}
