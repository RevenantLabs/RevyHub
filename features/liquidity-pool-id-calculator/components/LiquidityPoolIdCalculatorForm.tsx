"use client";

import { useState } from "react";
import { Button, Field, Input } from "@/core/ui";
import { copy } from "../copy";
import type { RawInput } from "../types";

const SECRET = /^S[A-Z2-7]{55}$/;

export function LiquidityPoolIdCalculatorForm({
  onSubmit,
  onEdit
}: {
  onSubmit: (raw: RawInput) => void;
  onEdit: () => void;
}) {
  const [assetXCode, setAssetXCode] = useState("");
  const [assetXIssuer, setAssetXIssuer] = useState("");
  const [assetYCode, setAssetYCode] = useState("");
  const [assetYIssuer, setAssetYIssuer] = useState("");
  const [feeBps, setFeeBps] = useState("30");
  const [rejected, setRejected] = useState(false);

  function guardedSetIssuer(setter: (value: string) => void, value: string) {
    onEdit();
    if (SECRET.test(value.trim()) || value.trim().startsWith("S")) {
      setter("");
      setRejected(true);
      return;
    }
    setRejected(false);
    setter(value);
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ assetXCode, assetXIssuer, assetYCode, assetYIssuer, feeBps });
      }}
    >
      <Field label={copy.fields.assetXCode.label} hint={copy.fields.assetXCode.hint}>
        {({ inputId, describedBy }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            value={assetXCode}
            onChange={(event) => {
              onEdit();
              setAssetXCode(event.target.value);
            }}
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>
      <Field label={copy.fields.assetXIssuer.label} hint={copy.fields.assetXIssuer.hint}>
        {({ inputId, describedBy }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            value={assetXIssuer}
            onChange={(event) => guardedSetIssuer(setAssetXIssuer, event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>
      <Field label={copy.fields.assetYCode.label} hint={copy.fields.assetYCode.hint}>
        {({ inputId, describedBy }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            value={assetYCode}
            onChange={(event) => {
              onEdit();
              setAssetYCode(event.target.value);
            }}
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>
      <Field label={copy.fields.assetYIssuer.label} hint={copy.fields.assetYIssuer.hint}>
        {({ inputId, describedBy }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            value={assetYIssuer}
            onChange={(event) => guardedSetIssuer(setAssetYIssuer, event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>
      {rejected ? <p role="alert">{copy.rejected}</p> : null}
      <Field label={copy.fields.feeBps.label} hint={copy.fields.feeBps.hint}>
        {({ inputId, describedBy }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            value={feeBps}
            onChange={(event) => {
              onEdit();
              setFeeBps(event.target.value);
            }}
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>
      <Button type="submit">{copy.submit}</Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          setAssetXCode("");
          setAssetXIssuer("");
          setAssetYCode("");
          setAssetYIssuer("");
          setFeeBps("30");
          setRejected(false);
          onEdit();
        }}
      >
        {copy.reset}
      </Button>
    </form>
  );
}
