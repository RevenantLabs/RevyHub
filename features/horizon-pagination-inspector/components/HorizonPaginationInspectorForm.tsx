"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Textarea } from "@/core/ui/Input";
import { copy } from "@/features/horizon-pagination-inspector/copy";

export function HorizonPaginationInspectorForm({
  onSubmit
}: {
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(value);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.formLabel} hint={copy.formHint}>
        {({ inputId, describedBy, invalid }) => (
          <Textarea
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder='{ "_links": { "next": { "href": "..." } }, "_embedded": { "records": [ ... ] } }'
            autoComplete="off"
            spellCheck={false}
            rows={8}
          />
        )}
      </Field>
      <Button type="submit">{copy.submit}</Button>
    </form>
  );
}
