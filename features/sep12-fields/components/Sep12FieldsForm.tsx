"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy } from "@/features/sep12-fields/copy";

export function Sep12FieldsForm({ onSubmit }: { onSubmit: (value: string) => void }) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(value);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.formLabel} hint={copy.formHint}>
        {({ inputId, describedBy, invalid }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="address_country_code"
            autoComplete="off"
            spellCheck={false}
            type="search"
          />
        )}
      </Field>
      <Button type="submit">{copy.submit}</Button>
    </form>
  );
}
