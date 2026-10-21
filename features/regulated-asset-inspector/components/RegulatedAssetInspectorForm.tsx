"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy, errorCopy } from "@/features/regulated-asset-inspector/copy";
import type { RegulatedAssetField, RegulatedAssetInspectorErrorCode } from "@/features/regulated-asset-inspector/types";

export function RegulatedAssetInspectorForm({
  onSubmit,
  pending,
  errorField,
  errorCode
}: {
  onSubmit: (values: { issuerId: string; assetCode: string }) => void;
  pending: boolean;
  errorField: RegulatedAssetField | null;
  errorCode: RegulatedAssetInspectorErrorCode | null;
}) {
  const [issuerId, setIssuerId] = useState("");
  const [assetCode, setAssetCode] = useState("");
  const message = errorCode ? errorCopy[errorCode].title : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ issuerId, assetCode });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field
        label={copy.issuerLabel}
        hint={copy.issuerHint}
        error={errorField === "issuerId" ? message : null}
      >
        {({ inputId, describedBy, invalid }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={issuerId}
            onChange={(event) => setIssuerId(event.target.value)}
            placeholder="G..."
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
          />
        )}
      </Field>
      <Field
        label={copy.assetLabel}
        hint={copy.assetHint}
        error={errorField === "assetCode" ? message : null}
      >
        {({ inputId, describedBy, invalid }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            value={assetCode}
            onChange={(event) => setAssetCode(event.target.value)}
            placeholder="USDC"
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? copy.loading : copy.submit}
      </Button>
    </form>
  );
}
