"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy } from "@/features/offer-liability-headroom/copy";

export function OfferLiabilityHeadroomForm({
  onSubmit,
  pending
}: {
  onSubmit: (value: string) => void;
  pending: boolean;
}) {
  const [accountId, setAccountId] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(accountId);
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
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            placeholder="G…"
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
          />
        )}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? copy.loading : copy.submit}
      </Button>
    </form>
  );
}
