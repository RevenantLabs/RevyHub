"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUp, ArrowDown, BadgeCheck, Ban, ShieldAlert, Scale, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { Input } from "@/components/ui/Input";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { AddressInput } from "@/components/stellar/AddressInput";
import { useNetwork } from "@/components/stellar/NetworkProvider";
import { checkTrustline } from "@/lib/stellar/trustline";
import type { TrustlineCheck } from "@/lib/stellar/trustline";

function AuthStateBadge({ authorization }: { authorization: NonNullable<TrustlineCheck["authorization"]> }) {
  const { authorized, authorizedToMaintainLiabilities, clawbackEnabled } = authorization;

  if (authorized) {
    return (
      <Badge tone="success">
        <BadgeCheck className="mr-1 h-3 w-3" aria-hidden />
        Authorized
      </Badge>
    );
  }

  if (authorizedToMaintainLiabilities) {
    return (
      <Badge tone="warning">
        <Scale className="mr-1 h-3 w-3" aria-hidden />
        Liabilities only
      </Badge>
    );
  }

  // Unauthorized — maybe with clawback
  if (clawbackEnabled) {
    return (
      <Badge tone="muted">
        <ShieldAlert className="mr-1 h-3 w-3" aria-hidden />
        Unauthorized · Clawback
      </Badge>
    );
  }

  return (
    <Badge tone="warning">
      <Ban className="mr-1 h-3 w-3" aria-hidden />
      Unauthorized
    </Badge>
  );
}

function DetailRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-white/50 px-4 py-2.5 text-sm transition hover:bg-white/70">
      <span className="flex items-center gap-2 font-medium text-[#4e5c73]">
        {icon}
        {label}
      </span>
      <span className="font-semibold text-[#172033]">{value}</span>
    </div>
  );
}

function TrustlineResult({ result }: { result: TrustlineCheck }) {
  if (!result.exists) {
    return (
      <StatusMessage
        type="warning"
        title="No trustline found"
        description={result.message}
      />
    );
  }

  const authLabel =
    result.authorization?.authorized
      ? "Authorized — the issuer has approved this trustline."
      : result.authorization?.authorizedToMaintainLiabilities
        ? "Not fully authorized – only maintaining existing liabilities is allowed."
        : "Unauthorized — the issuer has not approved this trustline.";

  return (
    <div className="space-y-4">
      <StatusMessage
        type="success"
        title="Trustline confirmed"
        description={authLabel}
        action={
          result.authorization ? (
            <div className="flex flex-wrap gap-2">
              <AuthStateBadge authorization={result.authorization} />
              {result.authorization.clawbackEnabled && (
                <Badge tone="muted">
                  <ShieldAlert className="mr-1 h-3 w-3" aria-hidden />
                  Clawback enabled
                </Badge>
              )}
            </div>
          ) : null
        }
      />
      <Card>
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-[#4e5c73]">
            <BookMarked className="h-4 w-4" aria-hidden />
            Trustline details
          </h3>
          <DetailRow
            label="Balance"
            value={result.balance ?? "0"}
            icon={<Scale className="h-4 w-4 text-[#47a8c7]" aria-hidden />}
          />
          <DetailRow
            label="Limit"
            value={result.limit ?? "—"}
            icon={<BookMarked className="h-4 w-4 text-[#47a8c7]" aria-hidden />}
          />
          {result.liabilities && (
            <>
              <DetailRow
                label="Buying liabilities"
                value={result.liabilities.buying}
                icon={<ArrowUp className="h-4 w-4 text-[#df6b48]" aria-hidden />}
              />
              <DetailRow
                label="Selling liabilities"
                value={result.liabilities.selling}
                icon={<ArrowDown className="h-4 w-4 text-[#4299b5]" aria-hidden />}
              />
            </>
          )}
          {result.lastModifiedLedger !== undefined && (
            <DetailRow
              label="Last modified ledger"
              value={String(result.lastModifiedLedger)}
              icon={<BookMarked className="h-4 w-4 text-[#8a98aa]" aria-hidden />}
            />
          )}
        </div>
      </Card>
    </div>
  );
}

export default function TrustlineCheckerPage() {
  const { network } = useNetwork();
  const [account, setAccount] = useState("");
  const [assetCode, setAssetCode] = useState("");
  const [issuer, setIssuer] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrustlineCheck | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await checkTrustline(account, assetCode, issuer, network);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
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
      {result !== null && <TrustlineResult result={result} />}
      {error !== null && (
        <StatusMessage type="error" title="Inspector report" description={error} />
      )}
      {result === null && error === null && (
        <StatusMessage
          type="info"
          title="Inspector report"
          description="The trust inspector needs an account, asset code, and issuer to look for the handshake."
        />
      )}
      {error && error.includes("Account not found on Stellar testnet") ? (
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
      {result === null && error === null && (
        <div className="rounded-lg border border-[#c7b9f3]/60 bg-[#f3efff] p-4 backdrop-blur-sm">
          <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-[#5b4b8a]">
            <BadgeCheck className="h-4 w-4" aria-hidden />
            Authorization states explained
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-[#4e5c73]">
            <li className="flex items-start gap-2">
              <Badge tone="success">
                <BadgeCheck className="mr-1 h-3 w-3" aria-hidden />
                Authorized
              </Badge>
              <span>Fully approved by the issuer — all operations allowed.</span>
            </li>
            <li className="flex items-start gap-2">
              <Badge tone="warning">
                <Scale className="mr-1 h-3 w-3" aria-hidden />
                Liabilities only
              </Badge>
              <span>Only maintaining existing offers is permitted; new buying is not.</span>
            </li>
            <li className="flex items-start gap-2">
              <Badge tone="warning">
                <Ban className="mr-1 h-3 w-3" aria-hidden />
                Unauthorized
              </Badge>
              <span>The issuer has not approved this trustline.</span>
            </li>
            {network === "testnet" && (
              <li className="mt-3 rounded-md border border-[#82cbe3]/40 bg-[#e0f6ff]/50 px-3 py-2 text-xs text-[#146783]">
                On testnet you can use the Testnet Faucet Helper to fund an account
                before checking trustlines.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
