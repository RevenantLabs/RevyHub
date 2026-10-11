"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input, Textarea } from "@/core/ui/Input";
import { copy } from "@/features/horizon-pagination-inspector/copy";
import type { RawHorizonPaginationInput } from "@/features/horizon-pagination-inspector/types";

/** Form collecting raw collection JSON and optional expected base origin. */
export function HorizonPaginationInspectorForm({
  onSubmit,
  onReset
}: {
  onSubmit: (input: RawHorizonPaginationInput) => void;
  onReset?: () => void;
}) {
  const [collection, setCollection] = useState("");
  const [expectedOrigin, setExpectedOrigin] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ collection, expectedOrigin });
  }

  function handleReset() {
    setCollection("");
    setExpectedOrigin("");
    onReset?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.collectionLabel} hint={copy.collectionHint} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Textarea
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={collection}
            onChange={(event) => setCollection(event.target.value)}
            placeholder={copy.collectionPlaceholder}
            autoComplete="off"
            spellCheck={false}
            rows={8}
          />
        )}
      </Field>

      <Field label={copy.expectedOriginLabel} hint={copy.expectedOriginHint}>
        {({ inputId, describedBy, invalid }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={expectedOrigin}
            onChange={(event) => setExpectedOrigin(event.target.value)}
            placeholder={copy.expectedOriginPlaceholder}
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit">{copy.submit}</Button>
        {onReset && (
          <Button type="button" variant="secondary" onClick={handleReset}>
            {copy.resetAll}
          </Button>
        )}
      </div>
    </form>
  );
}
