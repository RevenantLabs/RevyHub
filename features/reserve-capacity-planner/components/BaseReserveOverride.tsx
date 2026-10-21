"use client";

import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy } from "@/features/reserve-capacity-planner/copy";

export function BaseReserveOverride({
  value,
  onChange,
  error
}: {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
}) {
  return (
    <Field label={copy.baseReserveLabel} hint={copy.baseReserveHint} error={error}>
      {({ inputId, describedBy, invalid }) => (
        <Input
          id={inputId}
          name="baseReserve"
          aria-describedby={describedBy}
          aria-invalid={invalid}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={copy.baseReservePlaceholder}
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          className="font-mono"
        />
      )}
    </Field>
  );
}
