import { Badge } from "@/components/ui/Badge";
import { CopyableValue } from "@/components/stellar/CopyableValue";

export interface DisplayBalance {
  assetCode: string;
  issuer?: string;
  amount: string;
  isNative?: boolean;
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
        <div
          key={`${balance.assetCode}-${balance.issuer ?? "native"}`}
          className="rounded-lg border border-white/80 bg-white/68 p-4 shadow-[4px_4px_0_rgba(142,220,244,0.22)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            {balance.isNative ? (
              <NativeBalanceHeader />
            ) : balance.assetCode === "Liquidity pool shares" ? (
              <LiquidityPoolHeader balance={balance} />
            ) : (
              <IssuedBalanceHeader balance={balance} />
            )}
            <Badge tone="info" className="shrink-0 font-mono tracking-normal">
              {balance.amount}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
