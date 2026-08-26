"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy } from "@/features/asset-statistics/copy";
import type { AssetStatisticsField } from "@/features/asset-statistics/types";

export function AssetStatisticsForm({
  onSubmit,
  pending,
  errorField,
  errorMessage
}: {
  onSubmit: (values: { assetCode: string; issuerId: string }) => void;
  pending: boolean;
  errorField: AssetStatisticsField | null;
  errorMessage: string | null;
}) {
  const [assetCode, setAssetCode] = useState("");
  const [issuerId, setIssuerId] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ assetCode, issuerId });
  }

  const errorFor = (field: AssetStatisticsField) =>
    errorField === field ? errorMessage : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,10rem)_1fr]">
        <Field label={copy.assetCodeLabel} hint={copy.assetCodeHint} error={errorFor("assetCode")}>
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
              maxLength={12}
            />
          )}
        </Field>

        <Field label={copy.issuerLabel} hint={copy.issuerHint} error={errorFor("issuerId")}>
          {({ inputId, describedBy, invalid }) => (
            <Input
              id={inputId}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              value={issuerId}
              onChange={(event) => setIssuerId(event.target.value)}
              placeholder="GISSUER...XYZ"
              autoComplete="off"
              spellCheck={false}
              className="font-mono"
            />
          )}
        </Field>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? copy.loading : copy.submit}
      </Button>
    </form>
  );
}
