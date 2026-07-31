import { Badge } from "@/components/ui/Badge";
import { CopyableValue } from "@/components/stellar/CopyableValue";
import { ExternalLink } from "lucide-react";
import type { StellarNetwork } from "@/lib/stellar/horizon";

export interface DisplayBalance {
  assetCode: string;
  issuer?: string;
  amount: string;
  assetType?: "native" | "issued" | "liquidity_pool_shares";
  poolId?: string;
  isNative?: boolean;
}

const isValidPoolId = (id?: string) => typeof id === "string" && id.length === 64 && /^[0-9a-fA-F]+$/.test(id);

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

function LiquidityPoolHeader({ balance, network, isValidPoolId }: { balance: DisplayBalance; network?: StellarNetwork; isValidPoolId: (id?: string) => boolean }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-[#172033]">Liquidity Pool Shares</p>
      <div className="mt-1 text-xs text-[#68758a]">
        {isValidPoolId(balance.poolId) ? (
          <div className="flex items-center gap-2">
            <CopyableValue label="Pool ID" value={balance.poolId!} />
            {network ? (
              <a
                href={`https://stellar.expert/explorer/${network === "mainnet" ? "public" : "testnet"}/liquidity-pool/${balance.poolId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#178fb5] hover:text-[#0f6b8a]"
                title="View on Stellar Expert"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="sr-only">View on Stellar Expert</span>
              </a>
            ) : null}
          </div>
        ) : (
          "Invalid or missing pool ID"
        )}
      </div>
    </div>
  );
}

export function BalanceList({ balances, network }: { balances: DisplayBalance[]; network?: StellarNetwork }) {
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
          key={`${balance.assetCode}-${balance.issuer ?? balance.poolId ?? "native"}`}
          className="rounded-lg border border-white/80 bg-white/68 p-4 shadow-[4px_4px_0_rgba(142,220,244,0.22)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            {balance.isNative ? (
              <NativeBalanceHeader />
            ) : balance.assetType === "liquidity_pool_shares" ? (
              <LiquidityPoolHeader balance={balance} network={network} isValidPoolId={isValidPoolId} />
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
