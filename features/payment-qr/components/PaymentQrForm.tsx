"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/core/ui/Button";
import { Field } from "@/core/ui/Field";
import { Input, Select } from "@/core/ui/Input";
import { copy } from "@/features/payment-qr/copy";
import {
  byteLength,
  MEMO_MAX_BYTES,
  MSG_MAX_LENGTH,
  type RawPaymentForm
} from "@/features/payment-qr/schema";
import type { PaymentQrField } from "@/features/payment-qr/types";

export function PaymentQrForm({
  onSubmit,
  pending,
  errorField,
  errorMessage
}: {
  onSubmit: (values: RawPaymentForm) => void;
  pending: boolean;
  errorField: PaymentQrField | null;
  errorMessage: string | null;
}) {
  const [form, setForm] = useState<RawPaymentForm>({
    destination: "",
    amount: "",
    assetKind: "native",
    assetCode: "",
    assetIssuer: "",
    memo: "",
    msg: ""
  });

  const set = <K extends keyof RawPaymentForm>(key: K, value: RawPaymentForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const errorFor = (field: PaymentQrField) => (errorField === field ? errorMessage : null);

  const memoBytes = byteLength(form.memo);
  const msgLength = form.msg.length;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field
        label={copy.destinationLabel}
        hint={copy.destinationHint}
        error={errorFor("destination")}
        required
      >
        {({ inputId, describedBy, invalid, required }) => (
          <Input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            required={required}
            value={form.destination}
            onChange={(event) => set("destination", event.target.value)}
            placeholder="GABC...XYZ"
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.amountLabel} hint={copy.amountHint} error={errorFor("amount")} required>
          {({ inputId, describedBy, invalid, required }) => (
            <Input
              id={inputId}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              required={required}
              value={form.amount}
              onChange={(event) => set("amount", event.target.value)}
              placeholder="10.5"
              inputMode="decimal"
              autoComplete="off"
            />
          )}
        </Field>

        <Field label={copy.assetKindLabel}>
          {({ inputId }) => (
            <Select
              id={inputId}
              value={form.assetKind}
              onChange={(event) =>
                set("assetKind", event.target.value === "issued" ? "issued" : "native")
              }
            >
              <option value="native">{copy.assetNative}</option>
              <option value="issued">{copy.assetIssued}</option>
            </Select>
          )}
        </Field>
      </div>

      {form.assetKind === "issued" ? (
        <div className="grid gap-4 sm:grid-cols-[minmax(0,10rem)_1fr]">
          <Field label={copy.assetCodeLabel} error={errorFor("assetCode")} required>
            {({ inputId, describedBy, invalid, required }) => (
              <Input
                id={inputId}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                required={required}
                value={form.assetCode}
                onChange={(event) => set("assetCode", event.target.value)}
                placeholder="USDC"
                maxLength={12}
                autoComplete="off"
              />
            )}
          </Field>

          <Field label={copy.assetIssuerLabel} error={errorFor("assetIssuer")} required>
            {({ inputId, describedBy, invalid, required }) => (
              <Input
                id={inputId}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                required={required}
                value={form.assetIssuer}
                onChange={(event) => set("assetIssuer", event.target.value)}
                placeholder="GISSUER...XYZ"
                autoComplete="off"
                spellCheck={false}
                className="font-mono"
              />
            )}
          </Field>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={copy.memoLabel}
          hint={
            <>
              {copy.memoHint}{" "}
              <span
                aria-live="polite"
                className={memoBytes > MEMO_MAX_BYTES ? "font-bold text-[#9f342d]" : "font-bold"}
              >
                {copy.memoCounter(memoBytes)}
              </span>
            </>
          }
          error={errorFor("memo")}
        >
          {({ inputId, describedBy, invalid }) => (
            <Input
              id={inputId}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              value={form.memo}
              onChange={(event) => set("memo", event.target.value)}
              placeholder="Invoice 1001"
              autoComplete="off"
            />
          )}
        </Field>

        <Field
          label={copy.msgLabel}
          hint={
            <>
              {copy.msgHint}{" "}
              <span
                aria-live="polite"
                className={msgLength > MSG_MAX_LENGTH ? "font-bold text-[#9f342d]" : "font-bold"}
              >
                {copy.msgCounter(msgLength)}
              </span>
            </>
          }
          error={errorFor("msg")}
        >
          {({ inputId, describedBy, invalid }) => (
            <Input
              id={inputId}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              value={form.msg}
              onChange={(event) => set("msg", event.target.value)}
              maxLength={300}
              autoComplete="off"
            />
          )}
        </Field>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? copy.generating : copy.submit}
      </Button>
    </form>
  );
}
