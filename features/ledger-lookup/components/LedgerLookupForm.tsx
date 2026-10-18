"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy } from "@/features/ledger-lookup/copy";

export function LedgerLookupForm({
  onSubmit,
  pending,
  onChange,
  onReset
}: {
  onSubmit: (value: string) => void;
  pending: boolean;
  onChange: () => void;
  onReset: () => void;
}) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(value);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label={copy.formLabel} hint={copy.formHint}>
        {({ inputId, describedBy, invalid }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={value}
            onChange={(event) => {setValue(event.target.value); onChange();}}
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? copy.loading : copy.submit}
      </Button>
      <Button type="button" variant="secondary" onClick={() => {setValue(""); onReset();}}>{copy.reset}</Button>
    </form>
  );
}
