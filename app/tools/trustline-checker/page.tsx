"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUp, ArrowDown, BadgeCheck, Ban, ShieldAlert, Scale, BookMarked,
  Coins, RotateCcw, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CharacterPanel } from "@/components/ui/CharacterPanel";
import { Input } from "@/components/ui/Input";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { AddressInput } from "@/components/stellar/AddressInput";
import { useNetwork } from "@/components/stellar/NetworkProvider";
import { checkTrustline, getUSDCPreset } from "@/lib/stellar/trustline";
import type { TrustlineCheck } from "@/lib/stellar/trustline";
import { isCancelledError } from "@/lib/stellar/horizon";
import { cn } from "@/lib/utils";

/** A subtle shimmer pulse for the loading skeleton. */
const shimmer = "animate-pulse rounded-md bg-gradient-to-r from-[#e8edf4] via-[#f0f5fe] to-[#e8edf4] bg-[length:200%_100%]";

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

function SkeletonLine({ className }: { className?: string }) {
  return <div className={cn("h-4 w-full", shimmer, className)} />;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className={cn("flex gap-3 rounded-lg border border-[#c7d6e8]/40 bg-white/55 p-4", shimmer)}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/60">
          <Loader2 className="h-5 w-5 animate-spin text-[#47a8c7]" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonLine className="w-2/5" />
          <SkeletonLine className="w-4/5" />
          <div className="flex gap-2 pt-1">
            <SkeletonLine className="h-6 w-24 rounded-full" />
            <SkeletonLine className="h-6 w-28 rounded-full" />
          </div>
        </div>
      </div>
      <Card>
        <div className="space-y-3">
          <SkeletonLine className="mb-4 w-1/3" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="flex items-center justify-between gap-3 rounded-md bg-white/50 px-4 py-2.5"
            >
              <SkeletonLine className="w-1/4" />
              <SkeletonLine className="w-1/3" />
            </div>
          ))}
        </div>
      </Card>
    </div>
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

function TrustlineResult({ result, onReset }: { result: TrustlineCheck; onReset: () => void }) {
  if (!result.exists) {
    return (
      <StatusMessage
        type="warning"
        title="No trustline found"
        description={result.message}
        action={
          <Button variant="ghost" onClick={onReset}>
            <RotateCcw className="mr-1 h-4 w-4" aria-hidden />
            Check another
          </Button>
        }
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
          <div className="flex flex-wrap items-center gap-2">
            {result.authorization ? (
              <div className="flex flex-wrap gap-2">
                <AuthStateBadge authorization={result.authorization} />
                {result.authorization.clawbackEnabled && (
                  <Badge tone="muted">
                    <ShieldAlert className="mr-1 h-3 w-3" aria-hidden />
                    Clawback enabled
                  </Badge>
                )}
              </div>
            ) : null}
            <Button variant="ghost" onClick={onReset}>
              <RotateCcw className="mr-1 h-4 w-4" aria-hidden />
              Check another
            </Button>
          </div>
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
  const [touched, setTouched] = useState({ account: false, assetCode: false, issuer: false });
  const abortRef = useRef<AbortController | null>(null);

  const preset = getUSDCPreset(network);
  const isFormValid = account.trim().length >= 50 && assetCode.trim().length > 0 && issuer.trim().length >= 50;

  useEffect(() => {
    return () => {
      const controller = abortRef.current;
      abortRef.current = null;
      controller?.abort();
    };
  }, []);

  function applyUSDCPreset() {
    setAssetCode(preset.code);
    setIssuer(preset.issuer);
  }

  function handleReset() {
    setAccount("");
    setAssetCode("");
    setIssuer("");
    setResult(null);
    setError(null);
    setTouched({ account: false, assetCode: false, issuer: false });
  }

  function markTouched(field: "account" | "assetCode" | "issuer") {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await checkTrustline(account, assetCode, issuer, network, controller.signal);
      if (abortRef.current !== controller) return;
      setResult(data);
    } catch (err) {
      if (isCancelledError(err) || abortRef.current !== controller) return;
      setError(err instanceof Error ? err.message : "Unexpected error.");
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

          <div className="space-y-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#29364d]">Asset code</span>
              <Input
                value={assetCode}
                onChange={(event) => setAssetCode(event.target.value)}
                onBlur={() => markTouched("assetCode")}
                placeholder="USDC"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={applyUSDCPreset}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#70c7a7]/60 bg-[#dff8ee]/70 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-[#17664b] transition hover:bg-[#c5f0db]"
              >
                <Coins className="h-3.5 w-3.5" aria-hidden />
                USDC ({network})
              </button>
              <span className="self-center text-xs text-[#8a98aa]">
                Preset auto-fills the code and {network} issuer.
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <AddressInput value={issuer} onChange={setIssuer} label="Issuer address" />
            {touched.issuer && issuer.trim().length > 0 && issuer.trim().length < 30 && (
              <p className="text-xs font-medium text-[#df6b48]">
                Issuer addresses are usually 56 characters long.
              </p>
            )}
            {touched.issuer && issuer.trim().length === 0 && (
              <p className="text-xs font-medium text-[#df6b48]">
                The issuer address is required.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={loading || !isFormValid}>
              {loading ? "Inspecting..." : "Inspect handshake"}
            </Button>
            {(result !== null || error !== null) && (
              <Button type="button" variant="ghost" onClick={handleReset}>
                <RotateCcw className="mr-1 h-4 w-4" aria-hidden />
                Clear
              </Button>
            )}
          </div>
        </form>
      </Card>

      {loading && <LoadingSkeleton />}
      {result !== null && !loading && <TrustlineResult result={result} onReset={handleReset} />}
      {error !== null && !loading && (
        <StatusMessage
          type="error"
          title="Inspector report"
          description={error}
          action={
            <Button variant="ghost" onClick={handleReset}>
              <RotateCcw className="mr-1 h-4 w-4" aria-hidden />
              Try again
            </Button>
          }
        />
      )}

      {result === null && error === null && !loading && (
        <>
          <StatusMessage
            type="info"
            title="Inspector report"
            description="The trust inspector needs an account, asset code, and issuer to look for the handshake."
          />
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
        </>
      )}

      {network === "testnet" && error !== null && error.includes("Account not found") && (
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
      )}
    </div>
  );
}