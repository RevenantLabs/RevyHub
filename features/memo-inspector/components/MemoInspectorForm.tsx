"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input, Select } from "@/core/ui/Input";
import { copy } from "@/features/memo-inspector/copy";
import { byteLength } from "@/features/memo-inspector/lib/bytes";
import { TEXT_MAX_BYTES } from "@/features/memo-inspector/lib/memoInspector";
import { formatByteCount } from "@/features/memo-inspector/lib/format";
import { isMemoKind, requiresValue, type RawMemoForm } from "@/features/memo-inspector/schema";
import { MEMO_KINDS, type MemoField, type MemoKind } from "@/features/memo-inspector/types";

export function MemoInspectorForm({
  onSubmit,
  pending,
  errorField,
  errorMessage
}: {
  onSubmit: (values: RawMemoForm) => void;
  pending: boolean;
  errorField: MemoField | null;
  errorMessage: string | null;
}) {
  const [kind, setKind] = useState<MemoKind>("text");
  const [value, setValue] = useState("");

  // The limit applies to the bytes that will actually be encoded, and the
  // encoder trims the outer whitespace, so the counter measures the same thing.
  const byteCount = byteLength(value.trim());

  const errorFor = (field: MemoField) => (errorField === field ? errorMessage : null);

  function handleKindChange(next: string) {
    if (!isMemoKind(next)) return;
    setKind(next);
    // A hash is meaningless as text and text is meaningless as an id, so the
    // value never survives a type change.
    setValue("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ kind, value });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.kindLabel} hint={copy.kindHint} error={errorFor("kind")}>
        {({ inputId, describedBy, invalid }) => (
          <Select
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={kind}
            onChange={(event) => handleKindChange(event.target.value)}
          >
            {MEMO_KINDS.map((option) => (
              <option key={option} value={option}>
                {copy.kindOptions[option]}
              </option>
            ))}
          </Select>
        )}
      </Field>

      {requiresValue(kind) ? (
        <Field
          label={copy.valueLabels[kind]}
          hint={
            <>
              {copy.valueHints[kind]}
              {kind === "text" ? (
                <>
                  {" "}
                  <span
                    aria-live="polite"
                    className={byteCount > TEXT_MAX_BYTES ? "font-bold text-[#9f342d]" : "font-bold"}
                  >
                    {formatByteCount(byteCount, TEXT_MAX_BYTES)}
                  </span>
                </>
              ) : null}
            </>
          }
          error={errorFor("value")}
          required
        >
          {({ inputId, describedBy, invalid, required }) => (
            <Input
              id={inputId}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              required={required}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={copy.valuePlaceholders[kind]}
              inputMode={kind === "id" ? "numeric" : "text"}
              autoComplete="off"
              spellCheck={false}
              className={kind === "text" ? undefined : "font-mono"}
            />
          )}
        </Field>
      ) : (
        <p className="text-sm leading-6 text-[#68758a]">{copy.valueHints.none}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? copy.encoding : copy.submit}
      </Button>
    </form>
  );
}
