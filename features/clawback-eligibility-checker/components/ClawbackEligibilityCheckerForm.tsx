"use client";

import { useState } from "react";
import { Button, Field, Input } from "@/core/ui";
import { copy } from "../copy";
import type { RawInput } from "../types";

const SECRET = /^S[A-Z2-7]{55}$/;

export function ClawbackEligibilityCheckerForm({
  onSubmit,
  onEdit,
  pending
}: {
  onSubmit: (raw: RawInput) => void;
  onEdit: () => void;
  pending: boolean;
}) {
  const [issuerAccountId, setIssuerAccountId] = useState("");
  const [holderAccountId, setHolderAccountId] = useState("");
  const [assetCode, setAssetCode] = useState("");
  const [rejected, setRejected] = useState(false);

  function guardedSet(setter: (value: string) => void, value: string) {
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
        onSubmit({ issuerAccountId, holderAccountId, assetCode });
      }}
    >
      <Field label={copy.fields.issuerAccountId.label} hint={copy.fields.issuerAccountId.hint}>
        {({ inputId, describedBy }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            value={issuerAccountId}
            onChange={(event) => guardedSet(setIssuerAccountId, event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>
      <Field label={copy.fields.holderAccountId.label} hint={copy.fields.holderAccountId.hint}>
        {({ inputId, describedBy }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            value={holderAccountId}
            onChange={(event) => guardedSet(setHolderAccountId, event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>
      {rejected ? <p role="alert">{copy.rejected}</p> : null}
      <Field label={copy.fields.assetCode.label} hint={copy.fields.assetCode.hint}>
        {({ inputId, describedBy }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            value={assetCode}
            onChange={(event) => {
              onEdit();
              setAssetCode(event.target.value);
            }}
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? copy.loading : copy.submit}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          setIssuerAccountId("");
          setHolderAccountId("");
          setAssetCode("");
          setRejected(false);
          onEdit();
        }}
      >
        {copy.reset}
      </Button>
    </form>
  );
}
