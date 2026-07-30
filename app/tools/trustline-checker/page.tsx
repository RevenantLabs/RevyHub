"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { Input } from "@/components/ui/Input";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { AddressInput } from "@/components/stellar/AddressInput";
import { useNetwork } from "@/components/stellar/NetworkProvider";
import { checkTrustline } from "@/lib/stellar/trustline";
import { isCancelledError } from "@/lib/stellar/horizon";

// Shareable link parameters (see docs/ISSUES.md #38): ?account=...&asset_code=...&issuer=...
// Prefills fields only; a Horizon check still requires an explicit form submit.
const MAX_ADDRESS_PARAM_LENGTH = 100;
const MAX_ASSET_CODE_PARAM_LENGTH = 32;
const PRINTABLE_ASCII = /^[\x20-\x7E]*$/;

function sanitizeParam(raw: string | null, maxLength: number): string | null {
  if (raw === null) {
    return null;
  }

  const value = raw.trim();

  if (!value || value.length > maxLength || !PRINTABLE_ASCII.test(value)) {
    return null;
  }

  return value;
}

export function sanitizeAccountParam(raw: string | null): string | null {
  return sanitizeParam(raw, MAX_ADDRESS_PARAM_LENGTH);
}

export function sanitizeAssetCodeParam(raw: string | null): string | null {
  return sanitizeParam(raw, MAX_ASSET_CODE_PARAM_LENGTH);
}

export function sanitizeIssuerParam(raw: string | null): string | null {
  return sanitizeParam(raw, MAX_ADDRESS_PARAM_LENGTH);
}

function TrustlineCheckerContent() {
  const { network } = useNetwork();
  const searchParams = useSearchParams();
  const rawAccountParam = searchParams.get("account");
  const rawAssetCodeParam = searchParams.get("asset_code");
  const rawIssuerParam = searchParams.get("issuer");
  const [account, setAccount] = useState(() => sanitizeAccountParam(rawAccountParam) ?? "");
  const [assetCode, setAssetCode] = useState(() => sanitizeAssetCodeParam(rawAssetCodeParam) ?? "");
  const [issuer, setIssuer] = useState(() => sanitizeIssuerParam(rawIssuerParam) ?? "");
  const [ignoredParams] = useState(() => {
    const ignored: string[] = [];

    if (rawAccountParam !== null && sanitizeAccountParam(rawAccountParam) === null) {
      ignored.push("account");
    }

    if (rawAssetCodeParam !== null && sanitizeAssetCodeParam(rawAssetCodeParam) === null) {
      ignored.push("asset_code");
    }

    if (rawIssuerParam !== null && sanitizeIssuerParam(rawIssuerParam) === null) {
      ignored.push("issuer");
    }

    return ignored;
  });
  const [loading, setLoading] = useState(false);
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
            <Input
              value={assetCode}
              onChange={(event) => setAssetCode(event.target.value)}
              placeholder="USDC"
              maxLength={MAX_ASSET_CODE_PARAM_LENGTH}
            />
          </label>
          <AddressInput value={issuer} onChange={setIssuer} label="Issuer address" />
          <Button type="submit" disabled={loading}>
            {loading ? "Inspecting..." : "Inspect handshake"}
          </Button>
        </form>
      </Card>
      <StatusMessage type={message.type} title="Inspector report" description={message.text} />
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

export default function TrustlineCheckerPage() {
  return (
    <Suspense fallback={null}>
      <TrustlineCheckerContent />
    </Suspense>
  );
}
