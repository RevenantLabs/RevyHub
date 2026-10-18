"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { useNetwork } from "@/core/network/NetworkProvider";
import { copy } from "@/features/account-merge-preflight/copy";
import type {
  AccountMergeField,
  AccountMergePreflightInput
} from "@/features/account-merge-preflight/types";

export function AccountMergePreflightForm({
  onSubmit,
  pending,
  field,
  fieldError
}: {
  onSubmit: (value: AccountMergePreflightInput) => void;
  pending: boolean;
  field: AccountMergeField | null;
  fieldError?: string;
}) {
  const [sourceAccountId, setSourceAccountId] = useState("");
  const [destinationAccountId, setDestinationAccountId] = useState("");
  const { label: networkLabel } = useNetwork();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ sourceAccountId, destinationAccountId });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field
        label={copy.sourceLabel}
        hint={`${copy.sourceHint} ${networkLabel}.`}
        error={field === "sourceAccountId" ? fieldError : undefined}
        required
      >
        {({ inputId, describedBy, invalid, required }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={sourceAccountId}
            onChange={(event) => setSourceAccountId(event.target.value)}
            placeholder={copy.sourcePlaceholder}
            autoComplete="off"
            spellCheck={false}
            className="font-mono text-xs"
          />
        )}
      </Field>
      <Field
        label={copy.destinationLabel}
        hint={`${copy.destinationHint} ${networkLabel}.`}
        error={field === "destinationAccountId" ? fieldError : undefined}
        required
      >
        {({ inputId, describedBy, invalid, required }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={destinationAccountId}
            onChange={(event) => setDestinationAccountId(event.target.value)}
            placeholder={copy.destinationPlaceholder}
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
