"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { useNetwork } from "@/core/network/NetworkProvider";
import { copy } from "@/features/sequence-inspector/copy";
import type { RawSequenceInspectorInput } from "@/features/sequence-inspector/schema";

export function SequenceInspectorForm({
  onSubmit,
  pending
}: {
  onSubmit: (value: RawSequenceInspectorInput) => void;
  pending: boolean;
}) {
  const [accountId, setAccountId] = useState("");
  const [bumpTarget, setBumpTarget] = useState("");
  const { label: networkLabel } = useNetwork();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ accountId, bumpTarget });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.accountLabel} hint={`${copy.accountHint} ${networkLabel}.`} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            placeholder={copy.accountPlaceholder}
            autoComplete="off"
            spellCheck={false}
            className="font-mono text-xs"
          />
        )}
      </Field>
      <Field label={copy.bumpLabel} hint={copy.bumpHint}>
        {({ inputId, describedBy, invalid }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={bumpTarget}
            onChange={(event) => setBumpTarget(event.target.value)}
            placeholder={copy.bumpPlaceholder}
            inputMode="numeric"
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
