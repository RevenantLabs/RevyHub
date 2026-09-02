"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { useNetwork } from "@/core/network/NetworkProvider";
import { copy } from "@/features/contract-events/copy";
import type { RawContractEventsInput } from "@/features/contract-events/schema";

export function ContractEventsForm({
  onSubmit,
  pending
}: {
  onSubmit: (input: RawContractEventsInput) => void;
  pending: boolean;
}) {
  const [contractId, setContractId] = useState("");
  const [startLedger, setStartLedger] = useState("");
  const [endLedger, setEndLedger] = useState("");
  const { label } = useNetwork();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ contractId, startLedger, endLedger });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field
        label={copy.formLabel}
        hint={`${copy.formHint} Searching ${label}.`}
        required
      >
        {({ inputId, describedBy, invalid, required }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={contractId}
            onChange={(event) => setContractId(event.target.value)}
            placeholder="CABC...XYZ"
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.startLedgerLabel} required>
          {({ inputId, describedBy, invalid, required }) => (
            <Input
              id={inputId}
              type="number"
              min={0}
              step={1}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              required={required}
              value={startLedger}
              onChange={(event) => setStartLedger(event.target.value)}
              placeholder="1000000"
              autoComplete="off"
              className="font-mono"
            />
          )}
        </Field>

        <Field label={copy.endLedgerLabel} required>
          {({ inputId, describedBy, invalid, required }) => (
            <Input
              id={inputId}
              type="number"
              min={0}
              step={1}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              required={required}
              value={endLedger}
              onChange={(event) => setEndLedger(event.target.value)}
              placeholder="1000100"
              autoComplete="off"
              className="font-mono"
            />
          )}
        </Field>
      </div>

      <p className="text-xs leading-5 text-[#68758a]">{copy.retentionHint(17280)}</p>

      <Button type="submit" disabled={pending}>
        {pending ? copy.loading : copy.submit}
      </Button>
    </form>
  );
}
