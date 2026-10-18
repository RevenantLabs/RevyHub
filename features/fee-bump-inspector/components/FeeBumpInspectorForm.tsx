"use client";

import { useState, type FormEvent } from "react";
import { Networks } from "@stellar/stellar-sdk";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Select, Textarea, Input } from "@/core/ui/Input";
import { copy } from "@/features/fee-bump-inspector/copy";
import type { RawFeeBumpInput } from "@/features/fee-bump-inspector/schema";

export const CUSTOM_NETWORK = "custom";

/** Standard passphrases offered before the custom escape hatch. */
export const NETWORK_OPTIONS = [
  { value: Networks.PUBLIC, label: "Public network" },
  { value: Networks.TESTNET, label: "Testnet" },
  { value: Networks.FUTURENET, label: "Futurenet" }
] as const;

export function FeeBumpInspectorForm({
  onSubmit
}: {
  onSubmit: (input: RawFeeBumpInput) => void;
}) {
  const [envelope, setEnvelope] = useState("");
  const [choice, setChoice] = useState<string>(Networks.TESTNET);
  const [customPassphrase, setCustomPassphrase] = useState("");

  const isCustom = choice === CUSTOM_NETWORK;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      envelope,
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
            value={envelope}
            onChange={(event) => setEnvelope(event.target.value)}
            placeholder="AAAABQAAAAA..."
            autoComplete="off"
            spellCheck={false}
            rows={6}
          />
        )}
      </Field>

      <Field label={copy.networkLabel} hint={copy.networkHint} required>
        {({ inputId, describedBy, invalid, required }) => (
          <Select
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
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
          {({ inputId, describedBy, invalid, required }) => (
            <Input
              id={inputId}
              aria-describedby={describedBy}
              aria-invalid={invalid}
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
