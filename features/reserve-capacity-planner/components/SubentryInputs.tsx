"use client";

import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy } from "@/features/reserve-capacity-planner/copy";
import { COUNT_FIELDS, type CountField, type PlannerField } from "@/features/reserve-capacity-planner/types";

export function SubentryInputs({
  values,
  onChange,
  errorField,
  errorMessage
}: {
  values: Record<CountField, string>;
  onChange: (field: CountField, value: string) => void;
  errorField: PlannerField | null;
  errorMessage: string | null;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-bold text-[#172033]">{copy.subentriesLegend}</legend>
      <p className="text-xs leading-5 text-[#68758a]">{copy.subentriesHint}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {COUNT_FIELDS.map((field) => (
          <Field
            key={field}
            label={copy.counts[field].label}
            hint={copy.counts[field].hint}
            error={errorField === field ? errorMessage : null}
            required
          >
            {({ inputId, describedBy, invalid, required }) => (
              <Input
                id={inputId}
                name={field}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                required={required}
                value={values[field]}
                onChange={(event) => onChange(field, event.target.value)}
                inputMode="numeric"
                autoComplete="off"
                spellCheck={false}
                className="font-mono"
              />
            )}
          </Field>
        ))}
      </div>
    </fieldset>
  );
}
