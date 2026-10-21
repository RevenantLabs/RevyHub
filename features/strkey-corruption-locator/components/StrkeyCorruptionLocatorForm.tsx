"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy } from "@/features/strkey-corruption-locator/copy";

export function StrkeyCorruptionLocatorForm({
  onSubmit,
  pending
}: {
  onSubmit: (value: string) => void;
  pending: boolean;
}) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(value);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-4" noValidate aria-busy={pending}>
      <Field label={copy.formLabel} hint={copy.formHint}>
        {({ inputId, describedBy }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={copy.placeholder}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full min-w-0 font-mono text-sm sm:text-base"
          />
        )}
      </Field>
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? copy.submitting : copy.submit}
      </Button>
    </form>
  );
}
