"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Textarea } from "@/core/ui/Input";
import { copy } from "@/features/signature-hint-auditor/copy";
import type { RawSignatureHintAuditorInput } from "@/features/signature-hint-auditor/schema";

export function SignatureHintAuditorForm({
  onSubmit,
  pending = false
}: {
  onSubmit: (input: RawSignatureHintAuditorInput) => void;
  pending?: boolean;
}) {
  const [envelope, setEnvelope] = useState("");
  const [publicSigners, setPublicSigners] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ envelope, publicSigners });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.envelopeLabel} hint={copy.envelopeHint} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Textarea
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={envelope}
            onChange={(event) => setEnvelope(event.target.value)}
            placeholder="AAAAAgAAAAA..."
            autoComplete="off"
            spellCheck={false}
            rows={6}
          />
        )}
      </Field>

      <Field label={copy.signersLabel} hint={copy.signersHint}>
        {({ inputId, describedBy, invalid }) => (
          <Textarea
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={publicSigners}
            onChange={(event) => setPublicSigners(event.target.value)}
            placeholder="GABCDEF..."
            autoComplete="off"
            spellCheck={false}
            rows={3}
          />
        )}
      </Field>

      <Button type="submit" disabled={pending}>
        {copy.submit}
      </Button>
    </form>
  );
}
