"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { BaseReserveOverride } from "@/features/reserve-capacity-planner/components/BaseReserveOverride";
import { SubentryInputs } from "@/features/reserve-capacity-planner/components/SubentryInputs";
import { copy } from "@/features/reserve-capacity-planner/copy";
import { looksLikeSecretKey } from "@/features/reserve-capacity-planner/schema";
import type { PlannerField, ReserveCapacityPlannerRawInput } from "@/features/reserve-capacity-planner/types";

const initialValues: ReserveCapacityPlannerRawInput = {
  trustlines: "",
  offers: "",
  dataEntries: "",
  signers: "",
  baseReserve: "",
  startingBalance: ""
};

export function ReserveCapacityPlannerForm({
  onSubmit,
  onEdit,
  onSecretRejected,
  onReset,
  pending,
  errorField,
  errorMessage
}: {
  onSubmit: (value: ReserveCapacityPlannerRawInput) => void;
  onEdit: () => void;
  onSecretRejected: (field: PlannerField) => void;
  onReset: () => void;
  pending: boolean;
  errorField: PlannerField | null;
  errorMessage: string | null;
}) {
  const [values, setValues] = useState(initialValues);

  function update(field: PlannerField, value: string) {
    if (looksLikeSecretKey(value)) {
      setValues((current) => ({ ...current, [field]: "" }));
      onSecretRejected(field);
      return;
    }

    setValues((current) => ({ ...current, [field]: value }));
    onEdit();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <form noValidate onSubmit={handleSubmit} aria-busy={pending} className="space-y-5">
      <SubentryInputs
        values={values}
        onChange={update}
        errorField={errorField}
        errorMessage={errorMessage}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BaseReserveOverride
          value={values.baseReserve}
          onChange={(value) => update("baseReserve", value)}
          error={errorField === "baseReserve" ? errorMessage : null}
        />
        <Field
          label={copy.startingBalanceLabel}
          hint={copy.startingBalanceHint}
          error={errorField === "startingBalance" ? errorMessage : null}
        >
          {({ inputId, describedBy, invalid }) => (
            <Input
              id={inputId}
              name="startingBalance"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              value={values.startingBalance}
              onChange={(event) => update("startingBalance", event.target.value)}
              placeholder={copy.startingBalancePlaceholder}
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              className="font-mono"
            />
          )}
        </Field>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? copy.loading : copy.submit}
        </Button>
        <Button type="button" variant="ghost" onClick={onReset} className="w-full sm:w-auto">
          {copy.reset}
        </Button>
      </div>
    </form>
  );
}
