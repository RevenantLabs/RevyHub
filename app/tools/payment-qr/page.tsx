"use client";

import QRCode from "qrcode";
import { useMemo, useState } from "react";
import { AddressInput } from "@/components/stellar/AddressInput";
import { useNetwork } from "@/components/stellar/NetworkProvider";
import { QRPreview } from "@/components/stellar/QRPreview";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { Input } from "@/components/ui/Input";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { copyText } from "@/lib/copy";
import { buildPaymentQrFilename } from "@/lib/qrDownload";
import { createPaymentUri, validatePaymentForm } from "@/lib/stellar/paymentUri";

export default function PaymentQrPage() {
  const { network } = useNetwork();
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState<"XLM" | "ISSUED">("XLM");
  const [assetCode, setAssetCode] = useState("");
  const [assetIssuer, setAssetIssuer] = useState("");
  const [memo, setMemo] = useState("");
  const [uri, setUri] = useState("");
  const [qr, setQr] = useState("");
  const [downloadFilename, setDownloadFilename] = useState("");
  const [message, setMessage] = useState({ type: "info" as "info" | "success" | "warning" | "error", text: "The rocket assistant can turn payment details into a demo QR poster." });

  const fieldErrors = useMemo(
    () => validatePaymentForm({ destination, amount, asset, assetCode, assetIssuer, memo }),
    [destination, amount, asset, assetCode, assetIssuer, memo]
  );

  const hasErrors = Object.keys(fieldErrors).length > 0;

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const nextUri = createPaymentUri({ destination, amount, asset, assetCode, assetIssuer, memo, network });
      const nextQr = await QRCode.toDataURL(nextUri, { margin: 1, width: 256 });
      setUri(nextUri);
      setQr(nextQr);
      setDownloadFilename(buildPaymentQrFilename({ asset, assetCode }));
      setMessage({ type: "success", text: "The rocket assistant validated the details and finished the QR poster." });
    } catch (error) {
      setUri("");
      setQr("");
      setDownloadFilename("");
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
        description="The rocket assistant frames destination, amount, asset, and memo into a SEP-0007 formatted web+stellar:pay payment URI and QR poster."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="space-y-1">
              <AddressInput value={destination} onChange={setDestination} label="Destination address" />
              {fieldErrors.destination ? (
                <p className="text-xs text-[#9f342d]">{fieldErrors.destination}</p>
              ) : null}
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#29364d]">Amount</span>
              <Input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="10" inputMode="decimal" />
              {fieldErrors.amount ? (
                <p className="text-xs text-[#9f342d]">{fieldErrors.amount}</p>
              ) : null}
            </label>
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
              {fieldErrors.asset ? (
                <p className="text-xs text-[#9f342d]">{fieldErrors.asset}</p>
              ) : null}
            </label>
            {asset === "ISSUED" ? (
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-sm font-medium text-[#29364d]">Asset code</span>
                  <Input value={assetCode} onChange={(event) => setAssetCode(event.target.value)} placeholder="USDC" />
                  {fieldErrors.assetCode ? (
                    <p className="text-xs text-[#9f342d]">{fieldErrors.assetCode}</p>
                  ) : null}
                </label>
                <div className="space-y-1">
                  <AddressInput value={assetIssuer} onChange={setAssetIssuer} label="Asset issuer" />
                  {fieldErrors.assetIssuer ? (
                    <p className="text-xs text-[#9f342d]">{fieldErrors.assetIssuer}</p>
                  ) : null}
                </div>
              </div>
            ) : null}
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#29364d]">Memo optional</span>
              <Input value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="Invoice 1001" />
              {fieldErrors.memo ? (
                <p className="text-xs text-[#9f342d]">{fieldErrors.memo}</p>
              ) : null}
            </label>
            <Button type="submit" disabled={hasErrors}>
              Ask rocket to draw QR
            </Button>
          </form>
        </Card>
        <div className="space-y-4">
          <StatusMessage type={message.type} title="Rocket desk status" description={message.text} />
          {qr && downloadFilename ? <QRPreview dataUrl={qr} filename={downloadFilename} /> : null}
          {uri ? (
            <Card className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#7a8ba6]">SEP-0007 payment URI</span>
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
