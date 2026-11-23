"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { useNetwork } from "@/core/network/NetworkProvider";
import { copy } from "@/features/transaction-sequence-gap-auditor/copy";
import type { RawAuditorForm } from "@/features/transaction-sequence-gap-auditor/types";

export function TransactionSequenceGapAuditorForm({
  onSubmit,
  pending
}: {
  onSubmit: (value: RawAuditorForm) => void;
  pending: boolean;
}) {
  const [accountId, setAccountId] = useState("");
  const { network } = useNetwork();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ accountId });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field
        label={copy.accountLabel}
        hint={`${copy.formHint} ${copy.networkHint(network)}`}
        required
      >
        {({ inputId, describedBy, invalid, required }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
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
