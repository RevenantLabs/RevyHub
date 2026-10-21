"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input, Select } from "@/core/ui/Input";
import { copy, fieldErrorCopy } from "@/features/sep38-quote-viewer/copy";
import { scrubSecret } from "@/features/sep38-quote-viewer/lib/asset-pair-fields";
import type {
  Sep38QuoteViewerField,
  Sep38QuoteViewerRawInput
} from "@/features/sep38-quote-viewer/types";

export function Sep38QuoteViewerForm({
  onSubmit,
  pending,
  field
}: {
  onSubmit: (value: Sep38QuoteViewerRawInput) => void;
  pending: boolean;
  field?: Sep38QuoteViewerField;
}) {
  const [homeDomain, setHomeDomain] = useState("");
  const [offChainAsset, setOffChainAsset] = useState("");
  const [onChainAsset, setOnChainAsset] = useState("");
  const [sellSide, setSellSide] = useState("off-chain");
  const [sellAmount, setSellAmount] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = {
      homeDomain: scrubSecret(homeDomain),
      offChainAsset: scrubSecret(offChainAsset),
      onChainAsset: scrubSecret(onChainAsset),
      sellSide,
      sellAmount: scrubSecret(sellAmount)
    };
    if (next.homeDomain !== homeDomain) setHomeDomain(next.homeDomain);
    if (next.offChainAsset !== offChainAsset) setOffChainAsset(next.offChainAsset);
    if (next.onChainAsset !== onChainAsset) setOnChainAsset(next.onChainAsset);
    if (next.sellAmount !== sellAmount) setSellAmount(next.sellAmount);
    onSubmit(next);
  }

  return (
    <form
      aria-label={copy.formName}
      aria-busy={pending}
      noValidate
      onSubmit={handleSubmit}
      className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <div className="min-w-0 sm:col-span-2">
        <Field
          label={copy.homeDomainLabel}
          hint={copy.homeDomainHint}
          error={field === "home_domain" ? fieldErrorCopy.home_domain : null}
          required
        >
          {({ inputId, describedBy, invalid, required }) => (
            <Input
              id={inputId}
              name="homeDomain"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              required={required}
              value={homeDomain}
              onChange={(event) => setHomeDomain(scrubSecret(event.target.value))}
              autoComplete="off"
              spellCheck={false}
              inputMode="url"
            />
          )}
        </Field>
      </div>

      <div className="min-w-0">
        <Field
          label={copy.offChainLabel}
          hint={copy.offChainHint}
          error={field === "off_chain" ? fieldErrorCopy.off_chain : null}
          required
        >
          {({ inputId, describedBy, invalid, required }) => (
            <Input
              id={inputId}
              name="offChainAsset"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              required={required}
              value={offChainAsset}
              onChange={(event) => setOffChainAsset(scrubSecret(event.target.value))}
              autoComplete="off"
              spellCheck={false}
            />
          )}
        </Field>
      </div>

      <div className="min-w-0">
        <Field
          label={copy.onChainLabel}
          hint={copy.onChainHint}
          error={field === "on_chain" ? fieldErrorCopy.on_chain : null}
          required
        >
          {({ inputId, describedBy, invalid, required }) => (
            <Input
              id={inputId}
              name="onChainAsset"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              required={required}
              value={onChainAsset}
              onChange={(event) => setOnChainAsset(scrubSecret(event.target.value))}
              autoComplete="off"
              spellCheck={false}
            />
          )}
        </Field>
      </div>

      <div className="min-w-0">
        <Field
          label={copy.sellSideLabel}
          hint={copy.sellSideHint}
          error={field === "sell_side" ? fieldErrorCopy.sell_side : null}
          required
        >
          {({ inputId, describedBy, invalid, required }) => (
            <Select
              id={inputId}
              name="sellSide"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              required={required}
              value={sellSide}
              onChange={(event) => setSellSide(event.target.value)}
            >
              <option value="off-chain">{copy.sellOffChain}</option>
              <option value="on-chain">{copy.sellOnChain}</option>
            </Select>
          )}
        </Field>
      </div>

      <div className="min-w-0">
        <Field
          label={copy.amountLabel}
          hint={copy.amountHint}
          error={field === "amount" ? fieldErrorCopy.amount : null}
          required
        >
          {({ inputId, describedBy, invalid, required }) => (
            <Input
              id={inputId}
              name="sellAmount"
              aria-describedby={describedBy}
              aria-invalid={invalid}
              required={required}
              value={sellAmount}
              onChange={(event) => setSellAmount(scrubSecret(event.target.value))}
              autoComplete="off"
              spellCheck={false}
              inputMode="decimal"
            />
          )}
        </Field>
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? copy.working : copy.submit}
        </Button>
      </div>
    </form>
  );
}
