"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy } from "@/features/ledger-protocol-transition-map/copy";
import type { RawLedgerProtocolTransitionMapForm } from "@/features/ledger-protocol-transition-map/types";

export function LedgerProtocolTransitionMapForm({
  onSubmit,
  pending
}: {
  onSubmit: (values: RawLedgerProtocolTransitionMapForm) => void;
  pending: boolean;
}) {
  const [startLedger, setStartLedger] = useState("1000");
  const [count, setCount] = useState("20");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ startLedger, count });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.startLabel} hint={copy.startHint} required>
          {({ inputId, describedBy, invalid, required }) => (
            <Input
              id={inputId}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              required={required}
              value={startLedger}
              onChange={(event) => setStartLedger(event.target.value)}
              inputMode="numeric"
              autoComplete="off"
              className="font-mono"
            />
          )}
        </Field>

        <Field label={copy.countLabel} hint={copy.countHint} required>
          {({ inputId, describedBy, invalid, required }) => (
            <Input
              id={inputId}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              required={required}
              value={count}
              onChange={(event) => setCount(event.target.value)}
              inputMode="numeric"
              autoComplete="off"
            />
          )}
        </Field>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? copy.loading : copy.submit}
      </Button>
    </form>
  );
}
