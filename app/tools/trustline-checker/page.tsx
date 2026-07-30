"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { Input } from "@/components/ui/Input";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { AddressInput } from "@/components/stellar/AddressInput";
import { CopyableValue } from "@/components/stellar/CopyableValue";
import { useNetwork } from "@/components/stellar/NetworkProvider";
import { checkTrustline, type TrustlineCheck } from "@/lib/stellar/trustline";
import type { StellarNetwork } from "@/lib/stellar/horizon";

type ReportStatus = "info" | "success" | "warning" | "error";

interface Report {
  type: ReportStatus;
  text: string;
}

const initialMessage: Report = {
  type: "info",
  text: "The trust inspector needs an account, asset code, and issuer to look for the handshake."
};
import { isCancelledError } from "@/lib/stellar/horizon";

export default function TrustlineCheckerPage() {
  const { network } = useNetwork();
  const [account, setAccount] = useState("");
  const [assetCode, setAssetCode] = useState("");
  const [issuer, setIssuer] = useState("");
  const [loading, setLoading] = useState(false);

  // Stamping every verification with the network it was retrieved on lets the
  // displayed result and report be derived at render time. Toggling the network
  // invalidates the previous check because the stored network no longer matches,
  // so the UI never describes identifiers from the wrong Stellar network.
  const [verified, setVerified] = useState<
    { network: StellarNetwork; result: TrustlineCheck | null; message: Report } | null
  >(null);

  const result = verified?.network === network ? verified.result : null;
  const message = verified?.network === network ? verified.message : initialMessage;
  const [message, setMessage] = useState({ type: "info" as "info" | "success" | "warning" | "error", text: "The trust inspector needs an account, asset code, and issuer to look for the handshake." });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      const controller = abortRef.current;
      abortRef.current = null;
      controller?.abort();
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    try {
      const check = await checkTrustline(account, assetCode, issuer, network);
      setVerified({
        network,
        result: check,
        message: { type: check.exists ? "success" : "warning", text: check.message }
      });
    } catch (error) {
      setVerified({
        network,
        result: null,
        message: {
          type: "error",
          text: error instanceof Error ? error.message : "Unexpected error."
        }
      });
      const result = await checkTrustline(account, assetCode, issuer, network, controller.signal);
      if (abortRef.current !== controller) return;
      setMessage({ type: result.exists ? "success" : "warning", text: result.message });
    } catch (error) {
      if (isCancelledError(error) || abortRef.current !== controller) return;
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unexpected error." });
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <CharacterPanel
        tone="trust"
        eyebrow="Trust inspector"
        title="Trustline Checker"
        description={`The inspector looks for a friendly handshake between an account and an issued asset on Stellar ${network}.`}
      />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <AddressInput value={account} onChange={setAccount} label="Account address" />
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#29364d]">Asset code</span>
            <Input value={assetCode} onChange={(event) => setAssetCode(event.target.value)} placeholder="USDC" />
          </label>
          <AddressInput value={issuer} onChange={setIssuer} label="Issuer address" />
          <Button type="submit" disabled={loading}>
            {loading ? "Inspecting..." : "Inspect handshake"}
          </Button>
        </form>
      </Card>
      <StatusMessage type={message.type} title="Inspector report" description={message.text} />
      {result ? (
        <Card className="space-y-3">
          <p className="text-sm font-extrabold text-[#172033]">Verified asset identity</p>
          <dl className="grid gap-3 sm:grid-cols-[max-content_1fr] sm:items-center">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[#68758a]">Asset code</dt>
            <dd className="font-mono text-sm text-[#172033]">{result.assetCode}</dd>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[#68758a]">Issuer</dt>
            <dd className="min-w-0">
              <CopyableValue label={`${result.assetCode} issuer`} value={result.issuer} />
            </dd>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[#68758a]">Network</dt>
            <dd>
              <Badge tone="info">{result.network}</Badge>
            </dd>
          </dl>
        </Card>
      ) : null}
      {message.type === "error" && message.text.includes("Account not found on Stellar testnet") ? (
      {network === "testnet" && message.type === "error" && message.text.includes("Account not found") ? (
        <StatusMessage
          type="info"
          title="Fund the testnet account first"
          description="A trustline can only be checked after the account exists on testnet."
          action={
            <Link
              href="/tools/testnet-faucet"
              className="inline-flex rounded-md border border-[#82cbe3]/80 bg-white/60 px-3 py-2 text-sm font-extrabold text-[#178fb5] hover:bg-[#e0f6ff]"
            >
              Open Testnet Faucet Helper
            </Link>
          }
        />
      ) : null}
    </div>
  );
}
