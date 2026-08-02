import { Badge } from "@/components/ui/Badge";
import { CopyableValue } from "@/components/stellar/CopyableValue";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export interface DisplayBalance {
  assetCode: string;
  issuer?: string;
  amount: string;
  buyingLiabilities?: string;
  sellingLiabilities?: string;
  isNative?: boolean;
}

export function hasNonZeroLiabilities(balance: DisplayBalance): boolean {
  const buy = balance.buyingLiabilities;
  const sell = balance.sellingLiabilities;
  return (buy != null && buy !== "0.0000000") || (sell != null && sell !== "0.0000000");
}

export function allLiabilitiesZero(balance: DisplayBalance): boolean {
  const buy = balance.buyingLiabilities;
  const sell = balance.sellingLiabilities;
  return (
    (buy == null || buy === "0.0000000") &&
    (sell == null || sell === "0.0000000")
  );
}

const NATIVE_DESCRIPTION = "XLM powers transactions and fees on the Stellar network";

function NativeBalanceHeader() {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-[#172033]">
        <span aria-hidden className="text-[#f6c85f]">✦</span>
        <span>XLM — Native Asset</span>
      </p>
      <p className="mt-1 truncate text-xs text-[#68758a]">{NATIVE_DESCRIPTION}</p>
    </div>
  );
}

function IssuedBalanceHeader({ balance }: { balance: DisplayBalance }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-[#172033]">{balance.assetCode}</p>
      <p className="mt-1 text-xs text-[#68758a]">
        {balance.issuer ? (
          <CopyableValue label={`${balance.assetCode} issuer`} value={balance.issuer} />
        ) : (
          "Issued asset"
        )}
      </p>
    </div>
  );
}

function LiquidityPoolHeader({ balance }: { balance: DisplayBalance }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-[#172033]">Liquidity Pool Shares</p>
      <p className="mt-1 text-xs text-[#68758a]">
        {balance.issuer ? (
          <CopyableValue label="Liquidity pool ID" value={balance.issuer} />
        ) : null}
      </p>
    </div>
  );
}

function BalanceHeader({ balance }: { balance: DisplayBalance }) {
  if (balance.isNative) {
    return <NativeBalanceHeader />;
  }

  if (balance.assetCode === "Liquidity pool shares") {
    return <LiquidityPoolHeader balance={balance} />;
  }

  return <IssuedBalanceHeader balance={balance} />;
}

function BalanceCard({ balance }: { balance: DisplayBalance }) {
  const [showLiabilities, setShowLiabilities] = useState(false);
  const hasLiabilities = hasNonZeroLiabilities(balance);

  return (
    <div className="rounded-lg border border-white/80 bg-white/68 p-4 shadow-[4px_4px_0_rgba(142,220,244,0.22)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <BalanceHeader balance={balance} />
        <div className="flex shrink-0 items-center gap-2">
          <Badge tone="info" className="font-mono tracking-normal">
            {balance.amount}
          </Badge>
          {hasLiabilities && (
            <button
              type="button"
              onClick={() => setShowLiabilities(!showLiabilities)}
              className="rounded p-1 text-[#68758a] hover:bg-white/50 hover:text-[#172033]"
              aria-label={showLiabilities ? "Hide liabilities" : "Show liabilities"}
            >
              {showLiabilities ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {showLiabilities && (
        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/60 pt-3 text-xs">
          <div>
            <span className="block text-[#68758a]">Buying liabilities</span>
            <span className="font-medium text-[#172033]">{balance.buyingLiabilities ?? "0.0000000"}</span>
          </div>
          <div>
            <span className="block text-[#68758a]">Selling liabilities</span>
            <span className="font-medium text-[#172033]">{balance.sellingLiabilities ?? "0.0000000"}</span>
          </div>
        </div>
      )}

      {!hasLiabilities && allLiabilitiesZero(balance) && (
        <p className="mt-1 text-xs text-[#68758a]">No outstanding liabilities</p>
      )}
    </div>
  );
}

export function BalanceList({ balances }: { balances: DisplayBalance[] }) {
  if (balances.length === 0) {
    return (
      <div className="rounded-lg border border-white/80 bg-white/68 p-6 text-center shadow-[4px_4px_0_rgba(142,220,244,0.22)]">
        <p className="text-sm text-[#68758a]">
          This account has no balances. The moon wallet is empty.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {balances.map((balance) => (
        <BalanceCard key={`${balance.assetCode}-${balance.issuer ?? "native"}`} balance={balance} />
      ))}
    </div>
  );
}
