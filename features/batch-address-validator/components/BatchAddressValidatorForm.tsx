"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Textarea } from "@/core/ui/Input";
import { copy } from "@/features/batch-address-validator/copy";

export function BatchAddressValidatorForm({ onSubmit }: { onSubmit: (value: string) => void }) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(value);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.formLabel} hint={copy.formHint}>
        {({ inputId, describedBy }) => (
          <Textarea
            id={inputId}
            aria-describedby={describedBy}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={"GABC...XYZ\nGDEF...UVW"}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            rows={8}
            className="font-mono text-xs"
          />
        )}
      </Field>
      <Button type="submit">{copy.submit}</Button>
    </form>
  );
}
