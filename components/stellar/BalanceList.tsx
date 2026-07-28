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
}

export function BalanceList({ balances, network }: { balances: DisplayBalance[]; network?: StellarNetwork }) {
  const isValidPoolId = (id?: string) => typeof id === "string" && id.length === 64 && /^[0-9a-fA-F]+$/.test(id);
  return (
    <div className="space-y-3">
      {/* TODO(issue #4): Improve asset grouping, precision formatting, and empty/liquidity-pool display states. */}
      {balances.map((balance) => (
        <div
          key={`${balance.assetCode}-${balance.issuer ?? balance.poolId ?? "native"}`}
          className="rounded-lg border border-white/80 bg-white/68 p-4 shadow-[4px_4px_0_rgba(142,220,244,0.22)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#172033]">{balance.assetCode}</p>
              <div className="mt-1 text-xs text-[#68758a]">
                {balance.assetType === "liquidity_pool_shares" ? (
                  isValidPoolId(balance.poolId) ? (
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
                  )
                ) : balance.issuer ? (
                  <CopyableValue label={`${balance.assetCode} issuer`} value={balance.issuer} />
                ) : (
                  "Native Stellar asset in the moon wallet"
                )}
              </div>
            </div>
            <Badge tone="info">{balance.amount}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
