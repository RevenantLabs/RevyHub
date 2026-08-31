"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useAddressValidator } from "@/features/address-validator/hooks/useAddressValidator";
import { errorCopy } from "@/features/address-validator/copy";
import { AddressValidatorForm } from "@/features/address-validator/components/AddressValidatorForm";
import { AddressValidatorResult } from "@/features/address-validator/components/AddressValidatorResult";
import { AddressValidatorEmptyState } from "@/features/address-validator/components/AddressValidatorEmptyState";

export function AddressValidatorPanel() {
  const { state, submit } = useAddressValidator();

  return (
    <div className="space-y-5">
      <Card>
        <AddressValidatorForm onSubmit={submit} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type={state.code === "secret_seed_rejected" ? "warning" : "error"}
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "result" ? <AddressValidatorResult result={state.result} /> : null}

      {state.status === "idle" ? <AddressValidatorEmptyState /> : null}
    </div>
  );
}
