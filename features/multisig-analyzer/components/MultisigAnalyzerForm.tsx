"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy } from "@/features/multisig-analyzer/copy";

export function MultisigAnalyzerForm({
  onSubmit,
  pending
}: {
  onSubmit: (values: { envelope: string; sourceAccount: string }) => void;
  pending: boolean;
}) {
  const [envelope, setEnvelope] = useState("");
  const [sourceAccount, setSourceAccount] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ envelope, sourceAccount });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.envelopeLabel} hint={copy.envelopeHint}>
        {({ inputId, describedBy, invalid }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={envelope}
            onChange={(event) => setEnvelope(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
          />
        )}
      </Field>

      <Field label={copy.sourceAccountLabel} hint={copy.sourceAccountHint}>
        {({ inputId, describedBy, invalid }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={sourceAccount}
            onChange={(event) => setSourceAccount(event.target.value)}
            placeholder="G..."
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
