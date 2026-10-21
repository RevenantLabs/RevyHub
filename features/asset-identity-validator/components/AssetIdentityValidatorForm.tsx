"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input } from "@/core/ui/Input";
import { copy } from "@/features/asset-identity-validator/copy";
import { isSecretSeed } from "@/features/asset-identity-validator/lib/assetIdentityValidator.errors";
import type { RawAssetIdentityInput } from "@/features/asset-identity-validator/schema";

export function AssetIdentityValidatorForm({
  onSubmit,
  pending
}: {
  onSubmit: (value: RawAssetIdentityInput) => void;
  pending: boolean;
}) {
  const [code, setCode] = useState("");
  const [issuer, setIssuer] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submittedIssuer = issuer;

    if (isSecretSeed(submittedIssuer.replace(/\s+/g, ""))) setIssuer("");

    onSubmit({ code, issuer: submittedIssuer });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-4" noValidate aria-label={copy.formAriaLabel}>
      <style>{`
        .asset-identity-fields { display: grid; gap: 1rem; grid-template-columns: minmax(0, 1fr); }
        @media (min-width: 640px) {
          .asset-identity-fields { grid-template-columns: minmax(0, 11rem) minmax(0, 1fr); }
        }
      `}</style>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] asset-identity-fields">
        <Field label={copy.codeLabel} hint={copy.codeHint} required>
          {({ inputId, describedBy, invalid, required }) => (
            <Input
              id={inputId}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              required={required}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder={copy.codePlaceholder}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              disabled={pending}
              className="w-full min-w-0 font-mono"
            />
          )}
        </Field>

        <Field label={copy.issuerLabel} hint={copy.issuerHint} required>
          {({ inputId, describedBy, invalid, required }) => (
            <Input
              id={inputId}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              required={required}
              value={issuer}
              onChange={(event) => setIssuer(event.target.value)}
              placeholder={copy.issuerPlaceholder}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              disabled={pending}
              className="w-full min-w-0 font-mono"
            />
          )}
        </Field>
      </div>

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? copy.loading : copy.submit}
      </Button>
    </form>
  );
}
