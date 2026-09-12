"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy } from "@/features/strkey-inspector/copy";

export function StrkeyInspectorForm({
  onSubmit,
  pending = false
}: {
  onSubmit: (value: string) => void;
  pending?: boolean;
}) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(value);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.formLabel} hint={copy.formHint}>
        {({ inputId, describedBy }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="G..., M..., C..., T..., X..., P..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="font-mono"
          />
        )}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? copy.pendingSubmit : copy.submit}
      </Button>
    </form>
  );
}
