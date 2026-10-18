"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { useNetwork } from "@/core/network/NetworkProvider";
import { copy } from "@/features/transaction-lookup/copy";

export function TransactionLookupForm({
  onSubmit,
  pending
}: {
  onSubmit: (value: string) => void;
  pending: boolean;
}) {
  const [value, setValue] = useState("");
  const { label } = useNetwork();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(value);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.formLabel} hint={`${copy.formHint} Searching ${label}.`} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="3389e9f0f1a65f19736cacf544c2e825313e8447f569233bb8db39aa607c8889"
            autoComplete="off"
            spellCheck={false}
            className="font-mono text-xs"
          />
        )}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? copy.loading : copy.submit}
      </Button>
    </form>
  );
}
