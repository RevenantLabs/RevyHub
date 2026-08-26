"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy } from "@/features/account-merge-preflight/copy";

export function AccountMergePreflightForm({
  onSubmit,
  pending
}: {
  onSubmit: (source: string, destination: string) => void;
  pending: boolean;
}) {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(source, destination);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label={copy.formSourceLabel} hint={copy.formSourceHint}>
        {({ inputId, describedBy, invalid }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={source}
            onChange={(event) => setSource(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>
      <Field label={copy.formDestinationLabel} hint={copy.formDestinationHint}>
        {({ inputId, describedBy, invalid }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Working..." : copy.submit}
      </Button>
    </form>
  );
}
