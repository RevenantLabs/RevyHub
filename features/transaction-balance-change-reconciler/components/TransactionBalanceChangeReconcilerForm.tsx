"use client";

import { useState, type FormEvent } from "react";
import { Networks } from "@stellar/stellar-sdk";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input, Select, Textarea } from "@/core/ui/Input";
import { copy } from "@/features/transaction-balance-change-reconciler/copy";
import type { RawReconcilerInput } from "@/features/transaction-balance-change-reconciler/schema";

export const CUSTOM_NETWORK = "custom";

export const NETWORK_OPTIONS = [
  { value: Networks.PUBLIC, label: "Public network" },
  { value: Networks.TESTNET, label: "Testnet" },
  { value: Networks.FUTURENET, label: "Futurenet" }
] as const;

export function TransactionBalanceChangeReconcilerForm({
  onSubmit
}: {
  onSubmit: (input: RawReconcilerInput) => void;
}) {
  const [envelopeXdr, setEnvelopeXdr] = useState("");
  const [resultXdr, setResultXdr] = useState("");
  const [metaXdr, setMetaXdr] = useState("");
  const [choice, setChoice] = useState<string>(Networks.TESTNET);
  const [customPassphrase, setCustomPassphrase] = useState("");

  const isCustom = choice === CUSTOM_NETWORK;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      envelopeXdr,
      resultXdr,
      metaXdr,
      networkPassphrase: isCustom ? customPassphrase : choice
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.envelopeLabel} hint={copy.envelopeHint} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Textarea
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={envelopeXdr}
            onChange={(event) => setEnvelopeXdr(event.target.value)}
            placeholder="AAAAAgAAAAA..."
            autoComplete="off"
            spellCheck={false}
            rows={4}
          />
        )}
      </Field>

      <Field label={copy.resultLabel} hint={copy.resultHint} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Textarea
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={resultXdr}
            onChange={(event) => setResultXdr(event.target.value)}
            placeholder="AAAAAAAAA+"
            autoComplete="off"
            spellCheck={false}
            rows={3}
          />
        )}
      </Field>

      <Field label={copy.metaLabel} hint={copy.metaHint} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Textarea
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={metaXdr}
            onChange={(event) => setMetaXdr(event.target.value)}
            placeholder="AAAAAQAAAAA..."
            autoComplete="off"
            spellCheck={false}
            rows={5}
          />
        )}
      </Field>

      <Field label={copy.networkLabel} hint={copy.networkHint} required>
        {({ inputId, describedBy, required }) => (
          <Select
            id={inputId}
            aria-describedby={describedBy}
            required={required}
            value={choice}
            onChange={(event) => setChoice(event.target.value)}
          >
            {NETWORK_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            <option value={CUSTOM_NETWORK}>{copy.customOption}</option>
          </Select>
        )}
      </Field>

      {isCustom ? (
        <Field label={copy.customNetworkLabel} hint={copy.customNetworkHint} required>
          {({ inputId, describedBy, required }) => (
            <Input
              id={inputId}
              aria-describedby={describedBy}
              required={required}
              value={customPassphrase}
              onChange={(event) => setCustomPassphrase(event.target.value)}
              placeholder="Standalone Network ; February 2017"
              autoComplete="off"
              spellCheck={false}
            />
          )}
        </Field>
      ) : null}

      <Button type="submit">{copy.submit}</Button>
    </form>
  );
}
