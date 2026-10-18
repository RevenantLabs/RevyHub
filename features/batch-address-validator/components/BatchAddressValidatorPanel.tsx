"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useBatchAddressValidator } from "@/features/batch-address-validator/hooks/useBatchAddressValidator";
import { errorCopy } from "@/features/batch-address-validator/copy";
import { BatchAddressValidatorForm } from "@/features/batch-address-validator/components/BatchAddressValidatorForm";
import { BatchAddressValidatorResult } from "@/features/batch-address-validator/components/BatchAddressValidatorResult";
import { BatchAddressValidatorEmptyState } from "@/features/batch-address-validator/components/BatchAddressValidatorEmptyState";

export function BatchAddressValidatorPanel() {
  const { state, submit, redactions } = useBatchAddressValidator();

  return (
    <div className="space-y-5">
      <Card>
        {/*
          Keying on the redaction counter remounts the form when a submitted
          list contained a secret key, which is what actually clears it out of
          the textarea. Refusing to echo it in the results table is not enough
          on its own — the paste itself stays visible otherwise.
        */}
        <BatchAddressValidatorForm key={redactions} onSubmit={submit} />
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
