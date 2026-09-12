"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input, Select, Textarea } from "@/core/ui/Input";
import { copy } from "@/features/hash-calculator/copy";
import type { RawHashCalculatorForm } from "@/features/hash-calculator/schema";
import type {
  DataEncoding,
  HashCalculatorMode,
  NetworkPassphrasePreset
} from "@/features/hash-calculator/types";

/** Form component for submitting raw data or transaction envelopes. */
export function HashCalculatorForm({
  onSubmit,
  pending
}: {
  onSubmit: (values: RawHashCalculatorForm) => void;
  pending: boolean;
}) {
  const [mode, setMode] = useState<HashCalculatorMode>("data");
  const [data, setData] = useState("");
  const [encoding, setEncoding] = useState<DataEncoding>("utf8");
  const [envelope, setEnvelope] = useState("");
  const [passphrasePreset, setPassphrasePreset] = useState<NetworkPassphrasePreset>("testnet");
  const [customPassphrase, setCustomPassphrase] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "transaction" && envelope.trim().startsWith("S")) {
      const submitted = envelope;
      setEnvelope("");
      onSubmit({
        mode,
        data,
        encoding,
        envelope: submitted,
        passphrasePreset,
        customPassphrase
      });
      return;
    }
    onSubmit({
      mode,
      data,
      encoding,
      envelope,
      passphrasePreset,
      customPassphrase
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.formModeLabel}>
        {({ inputId, describedBy, invalid }) => (
          <Select
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={mode}
            onChange={(event) => setMode(event.target.value as HashCalculatorMode)}
          >
            <option value="data">{copy.modeData}</option>
            <option value="transaction">{copy.modeTransaction}</option>
          </Select>
        )}
      </Field>

      {mode === "data" ? (
        <>
          <Field label={copy.encodingLabel}>
            {({ inputId, describedBy, invalid }) => (
              <Select
                id={inputId}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                value={encoding}
                onChange={(event) => setEncoding(event.target.value as DataEncoding)}
              >
                <option value="utf8">{copy.encodingUtf8}</option>
                <option value="hex">{copy.encodingHex}</option>
                <option value="base64">{copy.encodingBase64}</option>
              </Select>
            )}
          </Field>

          <Field label={copy.dataLabel} hint={copy.dataHint} required>
            {({ inputId, describedBy, invalid, required }) => (
              <Textarea
                id={inputId}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                required={required}
                value={data}
                onChange={(event) => setData(event.target.value)}
                placeholder={copy.dataPlaceholder}
                autoComplete="off"
                spellCheck={false}
                rows={4}
              />
            )}
          </Field>
        </>
      ) : (
        <>
          <Field label={copy.envelopeLabel} hint={copy.envelopeHint} required>
            {({ inputId, describedBy, invalid, required }) => (
              <Textarea
                id={inputId}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                required={required}
                value={envelope}
                onChange={(event) => setEnvelope(event.target.value)}
                placeholder={copy.envelopePlaceholder}
                autoComplete="off"
                spellCheck={false}
                rows={4}
              />
            )}
          </Field>

          <Field label={copy.passphraseLabel} hint={copy.passphraseHint}>
            {({ inputId, describedBy, invalid }) => (
              <Select
                id={inputId}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                value={passphrasePreset}
                onChange={(event) =>
                  setPassphrasePreset(event.target.value as NetworkPassphrasePreset)
                }
              >
                <option value="testnet">{copy.presetTestnet}</option>
                <option value="public">{copy.presetPublic}</option>
                <option value="custom">{copy.presetCustom}</option>
              </Select>
            )}
          </Field>

          {passphrasePreset === "custom" ? (
            <Field
              label={copy.customPassphraseLabel}
              hint={copy.customPassphraseHint}
              required
            >
              {({ inputId, describedBy, invalid, required }) => (
                <Input
                  id={inputId}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  required={required}
                  value={customPassphrase}
                  onChange={(event) => setCustomPassphrase(event.target.value)}
                  placeholder={copy.customPassphrasePlaceholder}
                  autoComplete="off"
                  spellCheck={false}
                />
              )}
            </Field>
          ) : null}
        </>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? copy.submitting : copy.submit}
      </Button>
    </form>
  );
}
