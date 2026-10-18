"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { useNetwork } from "@/core/network/NetworkProvider";
import { copy } from "@/features/claimable-balance-readiness/copy";
import type { ClaimableBalanceReadinessField } from "@/features/claimable-balance-readiness/types";
import type { RawClaimableBalanceReadinessInput } from "@/features/claimable-balance-readiness/schema";

export function ClaimableBalanceReadinessForm({
  onSubmit,
  pending,
  errorField,
  errorMessage
}: {
  onSubmit: (value: RawClaimableBalanceReadinessInput) => void;
  pending: boolean;
  errorField: ClaimableBalanceReadinessField | null;
  errorMessage: string | null;
}) {
  const [balanceId, setBalanceId] = useState("");
  const [claimant, setClaimant] = useState("");
  const [evaluationTime, setEvaluationTime] = useState("2026-06-01T12:00:00Z");
  const { label: networkLabel } = useNetwork();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ balanceId, claimant, evaluationTime });
  }

  const errorFor = (field: ClaimableBalanceReadinessField) =>
    errorField === field ? errorMessage : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <p className="text-sm text-[#4e5c73]">Checking on {networkLabel}.</p>

      <Field
        label={copy.balanceLabel}
        hint={copy.balanceHint}
        error={errorFor("balanceId")}
        required
      >
        {({ inputId, describedBy, invalid, required }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={balanceId}
            onChange={(event) => setBalanceId(event.target.value)}
            placeholder={copy.balancePlaceholder}
            autoComplete="off"
            spellCheck={false}
            className="font-mono text-xs"
          />
        )}
      </Field>

      <Field
        label={copy.claimantLabel}
        hint={copy.claimantHint}
        error={errorFor("claimant")}
        required
      >
        {({ inputId, describedBy, invalid, required }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={claimant}
            onChange={(event) => setClaimant(event.target.value)}
            placeholder={copy.claimantPlaceholder}
            autoComplete="off"
            spellCheck={false}
            className="font-mono text-xs"
          />
        )}
      </Field>

      <Field
        label={copy.timeLabel}
        hint={copy.timeHint}
        error={errorFor("evaluationTime")}
        required
      >
        {({ inputId, describedBy, invalid, required }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={evaluationTime}
            onChange={(event) => setEvaluationTime(event.target.value)}
            placeholder={copy.timePlaceholder}
            autoComplete="off"
            spellCheck={false}
            className="font-mono text-xs"
          />
        )}
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? copy.loading : copy.submit}
      </Button>
    </form>
  );
}
