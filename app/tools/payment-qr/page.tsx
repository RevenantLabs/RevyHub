"use client";

import QRCode from "qrcode";
import { useState } from "react";
import { AddressInput } from "@/components/stellar/AddressInput";
import { QRPreview } from "@/components/stellar/QRPreview";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { FieldError } from "@/components/ui/FieldError";
import { Input } from "@/components/ui/Input";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { copyText } from "@/lib/copy";
import { createPaymentUri } from "@/lib/stellar/paymentUri";
import { validatePublicKey } from "@/lib/stellar/validateAddress";

interface FieldErrors {
  destination?: string;
  amount?: string;
  assetCode?: string;
  assetIssuer?: string;
  memo?: string;
}

function validateForm(
  destination: string,
  amount: string,
  asset: "XLM" | "ISSUED",
  assetCode: string,
  assetIssuer: string,
  memo: string,
): FieldErrors {
  const errors: FieldErrors = {};

  const destValidation = validatePublicKey(destination);
  if (!destValidation.valid) errors.destination = destValidation.message;

  const amountNum = Number(amount);
  if (!amount || !Number.isFinite(amountNum) || amountNum <= 0) {
    errors.amount = "Enter a positive payment amount.";
  }

  if (asset === "ISSUED") {
    if (!assetCode.trim()) {
      errors.assetCode = "Enter an issued asset code.";
    } else if (!/^[a-zA-Z0-9]{1,12}$/.test(assetCode.trim().toUpperCase())) {
      errors.assetCode = "Asset codes must be 1 to 12 letters or numbers.";
    }

    const issuerValidation = validatePublicKey(assetIssuer);
    if (!issuerValidation.valid) {
      errors.assetIssuer = issuerValidation.message;
    }
  }

  if (memo && memo.length > 28) {
    errors.memo = "Memo text should be 28 characters or less for a simple Stellar text memo.";
  }

  return errors;
}

export default function PaymentQrPage() {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState<"XLM" | "ISSUED">("XLM");
  const [assetCode, setAssetCode] = useState("");
  const [assetIssuer, setAssetIssuer] = useState("");
  const [memo, setMemo] = useState("");
  const [uri, setUri] = useState("");
  const [qr, setQr] = useState("");
  const [message, setMessage] = useState({ type: "info" as "info" | "success" | "warning" | "error", text: "The rocket assistant can turn payment details into a demo QR poster." });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors = validateForm(destination, amount, asset, assetCode, assetIssuer, memo);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      const nextUri = createPaymentUri({ destination, amount, asset, assetCode, assetIssuer, memo });
      const nextQr = await QRCode.toDataURL(nextUri, { margin: 1, width: 256 });
      setUri(nextUri);
      setQr(nextQr);
      setMessage({ type: "success", text: "The rocket assistant finished the QR poster." });
    } catch (error) {
      setUri("");
      setQr("");
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unexpected error." });
    }
  }

  async function copyUri() {
    if (!uri) return;
    try {
      await copyText(uri);
      setMessage({ type: "success", text: "Payment URI copied from the rocket assistant." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Clipboard permission failed." });
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <CharacterPanel
        tone="rocket"
        eyebrow="Rocket assistant"
        title="Payment QR Generator"
        description="The rocket assistant frames destination, amount, asset, and memo into a readable demo payment poster."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <form onSubmit={handleGenerate} className="space-y-5">
            <AddressInput
              value={destination}
              onChange={(value) => { setDestination(value); clearFieldError("destination"); }}
              label="Destination address"
              error={fieldErrors.destination}
            />
            <div className="space-y-2">
              <label htmlFor="payment-amount" className="text-sm font-medium text-[#29364d]">
                Amount
              </label>
              <Input
                id="payment-amount"
                value={amount}
                onChange={(event) => { setAmount(event.target.value); clearFieldError("amount"); }}
                placeholder="10"
                inputMode="decimal"
                aria-invalid={fieldErrors.amount ? true : undefined}
                aria-describedby={fieldErrors.amount ? "payment-amount-error" : undefined}
              />
              <FieldError id="payment-amount-error" message={fieldErrors.amount} />
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#29364d]">Asset</span>
              <select
                value={asset}
                onChange={(event) => setAsset(event.target.value as "XLM" | "ISSUED")}
                className="min-h-12 w-full rounded-md border border-[#c7d6e8] bg-white/78 px-4 text-sm text-[#172033] outline-none focus:border-[#47a8c7] focus:ring-2 focus:ring-[#8edcf4]/35"
              >
                <option value="XLM">XLM</option>
                <option value="ISSUED">Issued asset</option>
              </select>
            </label>
            {asset === "ISSUED" ? (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="payment-asset-code" className="text-sm font-medium text-[#29364d]">
                    Asset code
                  </label>
                  <Input
                    id="payment-asset-code"
                    value={assetCode}
                    onChange={(event) => { setAssetCode(event.target.value); clearFieldError("assetCode"); }}
                    placeholder="USDC"
                    aria-invalid={fieldErrors.assetCode ? true : undefined}
                    aria-describedby={fieldErrors.assetCode ? "payment-asset-code-error" : undefined}
                  />
                  <FieldError id="payment-asset-code-error" message={fieldErrors.assetCode} />
                </div>
                <AddressInput
                  value={assetIssuer}
                  onChange={(value) => { setAssetIssuer(value); clearFieldError("assetIssuer"); }}
                  label="Asset issuer"
                  error={fieldErrors.assetIssuer}
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <label htmlFor="payment-memo" className="text-sm font-medium text-[#29364d]">
                Memo optional
              </label>
              <Input
                id="payment-memo"
                value={memo}
                onChange={(event) => setMemo(event.target.value)}
                placeholder="Invoice 1001"
                aria-invalid={fieldErrors.memo ? true : undefined}
                aria-describedby={fieldErrors.memo ? "payment-memo-error" : undefined}
              />
              <FieldError id="payment-memo-error" message={fieldErrors.memo} />
            </div>
            <Button type="submit">Ask rocket to draw QR</Button>
          </form>
        </Card>
        <div className="space-y-4">
          <StatusMessage type={message.type} title="Rocket desk status" description={message.text} />
          {qr ? <QRPreview dataUrl={qr} /> : null}
          {uri ? (
            <Card className="space-y-3">
              <p className="break-all text-xs text-[#4e5c73]">{uri}</p>
              <Button type="button" variant="secondary" onClick={copyUri}>
                Copy URI
              </Button>
            </Card>
          ) : null}
          <StatusMessage type="warning" title="Rocket safety note" description="This tool does not submit payments. Users must verify destination, amount, asset, and memo in their wallet." />
        </div>
      </div>
    </div>
  );
}
