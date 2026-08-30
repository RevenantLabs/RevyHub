"use client";

import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy, errorCopy } from "@/features/amount-converter/copy";
import type { AmountConverterErrorCode, AmountConverterField } from "@/features/amount-converter/types";

export function AmountConverterForm({
  stroops,
  amount,
  errorField,
  errorCode,
  onStroopsChange,
  onAmountChange,
  onLoadMaxExample,
  onReset
}: {
  stroops: string;
  amount: string;
  errorField: AmountConverterField | null;
  errorCode: AmountConverterErrorCode | null;
  onStroopsChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onLoadMaxExample: () => void;
  onReset: () => void;
}) {
  const fieldError = (field: AmountConverterField) =>
    errorField === field && errorCode ? errorCopy[errorCode].title : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.stroopsLabel} hint={copy.stroopsHint} error={fieldError("stroops")}>
          {({ inputId, describedBy, invalid }) => (
            <Input
              id={inputId}
              aria-describedby={describedBy}
              aria-invalid={invalid || errorField === "stroops"}
              value={stroops}
              onChange={(event) => onStroopsChange(event.target.value)}
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              className="font-mono"
            />
          )}
        </Field>

        <Field label={copy.amountLabel} hint={copy.amountHint} error={fieldError("amount")}>
          {({ inputId, describedBy, invalid }) => (
            <Input
              id={inputId}
              aria-describedby={describedBy}
              aria-invalid={invalid || errorField === "amount"}
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              className="font-mono"
            />
          )}
        </Field>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={onLoadMaxExample}>
          {copy.maxExample}
        </Button>
        <Button type="button" variant="ghost" onClick={onReset}>
          {copy.submit}
        </Button>
      </div>
      <p className="text-sm text-[#68758a]">{copy.maxExampleHint}</p>
    </div>
  );
}
