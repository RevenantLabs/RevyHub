"use client";

import { useState, type FormEvent } from "react";
import { Button, Field, Textarea } from "@/core/ui";
import { copy } from "../copy";

export function ContractDeployPreviewForm({ onSubmit, onEdit }: { onSubmit: (value: string) => void; onEdit: () => void }) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(value);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label={copy.fieldLabel} hint={copy.fieldHint}>
        {({ inputId, describedBy }) => (
          <Textarea
            id={inputId}
            aria-describedby={describedBy}
            value={value}
            onChange={(event) => {
              onEdit();
              setValue(event.target.value);
            }}
            rows={6}
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>
      <Button type="submit">{copy.submit}</Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          setValue("");
          onEdit();
        }}
      >
        {copy.reset}
      </Button>
    </form>
  );
}
