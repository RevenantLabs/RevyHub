"use client";

import QRCode from "qrcode";
import { useState, useCallback, useRef } from "react";
import { AddressInput } from "@/components/stellar/AddressInput";
import { QRPreview } from "@/components/stellar/QRPreview";
import { QRScanner } from "@/components/stellar/QRScanner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { Input } from "@/components/ui/Input";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { copyText } from "@/lib/copy";
import { createPaymentUri, parsePaymentUri } from "@/lib/stellar/paymentUri";

export default function PaymentQrPage() {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState<"XLM" | "ISSUED">("XLM");
  const [assetCode, setAssetCode] = useState("");
  const [assetIssuer, setAssetIssuer] = useState("");
  const [memo, setMemo] = useState("");
  const [uri, setUri] = useState("");
  const [qr, setQr] = useState("");
  const [message, setMessage] = useState({
    type: "info" as "info" | "success" | "warning" | "error",
    text: "The rocket assistant can turn payment details into a demo QR poster. You can also scan an existing QR code with your camera."
  });
  const [scanTab, setScanTab] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  const generateQr = useCallback(async (nextUri: string) => {
    const nextQr = await QRCode.toDataURL(nextUri, { margin: 1, width: 256 });
    setUri(nextUri);
    setQr(nextQr);
  }, []);

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const nextUri = createPaymentUri({ destination, amount, asset, assetCode, assetIssuer, memo });
      await generateQr(nextUri);
      setMessage({ type: "success", text: "The rocket assistant finished the QR poster." });
    } catch (error) {
      setUri("");
      setQr("");
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unexpected error." });
    }
  }

  async function handleScanResult(data: string) {
    try {
      const parsed = parsePaymentUri(data);
      setDestination(parsed.destination);
      setAmount(parsed.amount);
      setAsset(parsed.asset);
      if (parsed.asset === "ISSUED") {
        setAssetCode(parsed.assetCode ?? "");
        setAssetIssuer(parsed.assetIssuer ?? "");
      } else {
        setAssetCode("");
        setAssetIssuer("");
      }
      setMemo(parsed.memo ?? "");

      // Generate preview from the scanned data
      const nextUri = createPaymentUri(parsed);
      await generateQr(nextUri);

      setScanTab(false);
      setMessage({ type: "success", text: "The rocket assistant parsed the scanned QR code and filled in the details." });

      // Scroll the form into view on small screens
      viewportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Invalid QR content." });
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
    <div className="mx-auto max-w-5xl space-y-6" ref={viewportRef}>
      <CharacterPanel
        tone="rocket"
        eyebrow="Rocket assistant"
        title="Payment QR Generator"
        description="The rocket assistant frames destination, amount, asset, and memo into a readable demo payment poster."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left column: Form */}
        <div className="space-y-6">
          <Card>
            <form onSubmit={handleGenerate} className="space-y-5">
              <AddressInput value={destination} onChange={setDestination} label="Destination address" />
              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#29364d]">Amount</span>
                <Input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="10" inputMode="decimal" />
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
              </label>
              {asset === "ISSUED" ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-[#29364d]">Asset code</span>
                    <Input value={assetCode} onChange={(event) => setAssetCode(event.target.value)} placeholder="USDC" />
                  </label>
                  <AddressInput value={assetIssuer} onChange={setAssetIssuer} label="Asset issuer" />
                </div>
              ) : null}
              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#29364d]">Memo optional</span>
                <Input value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="Invoice 1001" />
              </label>
              <Button type="submit">Ask rocket to draw QR</Button>
            </form>
          </Card>
        </div>

        {/* Right column: Status, scanner, preview */}
        <div className="space-y-4">
          <StatusMessage type={message.type} title="Rocket desk status" description={message.text} />

          {/* Scanner section */}
          <div>
            <button
              type="button"
              onClick={() => setScanTab(!scanTab)}
              className="flex w-full items-center justify-between rounded-lg border border-white/80 bg-white/70 p-3 text-sm font-semibold text-[#172033] transition hover:bg-white/85"
              aria-expanded={scanTab}
            >
              <span>Scan QR from camera</span>
              <span className={`text-xs text-[#68758a] transition ${scanTab ? "rotate-180" : ""}`}>▾</span>
            </button>
            {scanTab ? (
              <div className="mt-3">
                <QRScanner onScan={handleScanResult} />
              </div>
            ) : null}
          </div>

          {/* QR Preview */}
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
