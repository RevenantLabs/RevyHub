"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy } from "@/features/muxed-account-codec/copy";
import type {
  MuxedAccountCodecMode,
  RawMuxedAccountCodecInput
} from "@/features/muxed-account-codec/types";

export function MuxedAccountCodecForm({
  onSubmit,
  onReset
}: {
  onSubmit: (input: RawMuxedAccountCodecInput) => void;
  onReset?: () => void;
}) {
  const [mode, setMode] = useState<MuxedAccountCodecMode>("decode");
  const [muxedAddress, setMuxedAddress] = useState("");
  const [baseAddress, setBaseAddress] = useState("");
  const [id, setId] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      mode,
      muxedAddress,
      baseAddress,
      id
    });
  }

  function handleReset() {
    setMuxedAddress("");
    setBaseAddress("");
    setId("");
    onReset?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={copy.modeLabel}>
        {({ inputId, describedBy }) => (
          <div
            id={inputId}
            aria-describedby={describedBy}
            className="flex flex-wrap gap-4"
            role="radiogroup"
          >
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#172033]">
              <input
                type="radio"
                name="muxed-codec-mode"
                value="decode"
                checked={mode === "decode"}
                onChange={() => setMode("decode")}
              />
              {copy.modeDecode}
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#172033]">
              <input
                type="radio"
                name="muxed-codec-mode"
                value="encode"
                checked={mode === "encode"}
                onChange={() => setMode("encode")}
              />
              {copy.modeEncode}
            </label>
          </div>
        )}
      </Field>

      {mode === "decode" ? (
        <Field label={copy.decodeAddressLabel} hint={copy.decodeAddressHint}>
          {({ inputId, describedBy }) => (
            <Input
              id={inputId}
              aria-describedby={describedBy}
              value={muxedAddress}
              onChange={(event) => setMuxedAddress(event.target.value)}
              placeholder={copy.decodeAddressPlaceholder}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className="font-mono"
            />
          )}
        </Field>
      ) : (
        <>
          <Field label={copy.baseAddressLabel} hint={copy.baseAddressHint}>
            {({ inputId, describedBy }) => (
              <Input
                id={inputId}
                aria-describedby={describedBy}
                value={baseAddress}
                onChange={(event) => setBaseAddress(event.target.value)}
                placeholder={copy.baseAddressPlaceholder}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="font-mono"
              />
            )}
          </Field>
          <Field label={copy.idLabel} hint={copy.idHint}>
            {({ inputId, describedBy }) => (
              <Input
                id={inputId}
                aria-describedby={describedBy}
                value={id}
                onChange={(event) => setId(event.target.value)}
                placeholder={copy.idPlaceholder}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="font-mono"
              />
            )}
          </Field>
        </>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="submit">
          {mode === "decode" ? copy.submitDecode : copy.submitEncode}
        </Button>
        <Button type="button" variant="secondary" onClick={handleReset}>
          {copy.reset}
        </Button>
      </div>
    </form>
  );
}
