"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input, Textarea } from "@/core/ui/Input";
import { copy } from "@/features/result-code-explainer/copy";
import type { ResultCodeExplainerMode } from "@/features/result-code-explainer/types";

export function ResultCodeExplainerForm({
  onSubmit,
  search,
  onSearchChange
}: {
  onSubmit: (value: { mode: ResultCodeExplainerMode; value: string; search: string }) => void;
  search: string;
  onSearchChange: (value: string) => void;
}) {
  const [mode, setMode] = useState<ResultCodeExplainerMode>("code");
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ mode, value, search });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.modeLabel}>
        {({ inputId, describedBy }) => (
          <div
            id={inputId}
            aria-describedby={describedBy}
            className="flex flex-wrap gap-3"
            role="radiogroup"
          >
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#172033]">
              <input
                type="radio"
                name="result-input-mode"
                value="code"
                checked={mode === "code"}
                onChange={() => setMode("code")}
              />
              {copy.modeCode}
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#172033]">
              <input
                type="radio"
                name="result-input-mode"
                value="xdr"
                checked={mode === "xdr"}
                onChange={() => setMode("xdr")}
              />
              {copy.modeXdr}
            </label>
          </div>
        )}
      </Field>

      {mode === "code" ? (
        <Field label={copy.codeLabel} hint={copy.codeHint} required>
          {({ inputId, describedBy, invalid, required }) => (
            <Textarea
              id={inputId}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              required={required}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={copy.codePlaceholder}
              autoComplete="off"
              spellCheck={false}
              rows={4}
              className="font-mono text-xs"
            />
          )}
        </Field>
      ) : (
        <Field label={copy.xdrLabel} hint={copy.xdrHint} required>
          {({ inputId, describedBy, invalid, required }) => (
            <Textarea
              id={inputId}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              required={required}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={copy.xdrPlaceholder}
              autoComplete="off"
              spellCheck={false}
              rows={4}
              className="font-mono text-xs"
            />
          )}
        </Field>
      )}

      <Field label={copy.searchLabel} hint={copy.searchHint}>
        {({ inputId, describedBy }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={copy.searchPlaceholder}
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>

      <Button type="submit">{copy.submit}</Button>
    </form>
  );
}
