"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy } from "@/features/ledger-close-cadence/copy";
import type { RawLedgerCloseCadenceForm } from "@/features/ledger-close-cadence/types";

export function LedgerCloseCadenceForm({
  onSubmit,
  pending
}: {
  onSubmit: (values: RawLedgerCloseCadenceForm) => void;
  pending: boolean;
}) {
  const [sampleSize, setSampleSize] = useState("20");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ sampleSize });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.formLabel} hint={copy.formHint} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={sampleSize}
            onChange={(event) => setSampleSize(event.target.value)}
            inputMode="numeric"
            autoComplete="off"
          />
        )}
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? copy.loading : copy.submit}
      </Button>
    </form>
  );
}
