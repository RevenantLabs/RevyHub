"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { useNetwork } from "@/core/network/NetworkProvider";
import { copy } from "@/features/claimable-balances/copy";
import type { ClaimableBalancesField, ClaimableBalancesMode } from "@/features/claimable-balances/types";
import type { RawClaimableBalancesInput } from "@/features/claimable-balances/schema";

export function ClaimableBalancesForm({
  onSubmit,
  pending,
  errorField,
  errorMessage
}: {
  onSubmit: (value: RawClaimableBalancesInput) => void;
  pending: boolean;
  errorField: ClaimableBalancesField | null;
  errorMessage: string | null;
}) {
  const [mode, setMode] = useState<ClaimableBalancesMode>("account");
  const [accountId, setAccountId] = useState("");
  const [balanceId, setBalanceId] = useState("");
  const { label: networkLabel } = useNetwork();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ mode, accountId, balanceId });
  }

  const errorFor = (field: ClaimableBalancesField) =>
    errorField === field ? errorMessage : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.modeLabel} hint={`Searching ${networkLabel}.`}>
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
                name="lookup-mode"
                value="account"
                checked={mode === "account"}
                onChange={() => setMode("account")}
              />
              {copy.modeAccount}
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#172033]">
              <input
                type="radio"
                name="lookup-mode"
                value="balance"
                checked={mode === "balance"}
                onChange={() => setMode("balance")}
              />
              {copy.modeBalance}
            </label>
          </div>
        )}
      </Field>

      {mode === "account" ? (
        <Field
          label={copy.accountLabel}
          hint={copy.accountHint}
          error={errorFor("accountId")}
          required
        >
          {({ inputId, describedBy, invalid, required }) => (
            <Input
              id={inputId}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              required={required}
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
              placeholder={copy.accountPlaceholder}
              autoComplete="off"
              spellCheck={false}
              className="font-mono text-xs"
            />
          )}
        </Field>
      ) : (
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
      )}

      <Button type="submit" disabled={pending}>
        {pending ? copy.loading : copy.submit}
      </Button>
    </form>
  );
}
