import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CopyableValue } from "@/components/stellar/CopyableValue";

export interface DisplayBalance {
  assetCode: string;
  issuer?: string;
  amount: string;
}

interface BalanceListProps {
  balances: DisplayBalance[];
  lastUpdated?: Date;
  onRefresh?: () => void | Promise<void>;
  isRefreshing?: boolean;
}

function formatTimestamp(date: Date) {
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit"
  });
}

export function BalanceList({ balances, lastUpdated, onRefresh, isRefreshing }: BalanceListProps) {
  return (
    <div className="space-y-3">
      {/* TODO(issue #4): Improve asset grouping, precision formatting, and empty/liquidity-pool display states. */}
      {lastUpdated && onRefresh ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/80 bg-white/55 px-4 py-2 text-xs text-[#4e5c73] shadow-[3px_3px_0_rgba(142,220,244,0.2)]">
          <p className="font-semibold uppercase tracking-wide">
            Last updated {formatTimestamp(lastUpdated)}
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onRefresh?.()}
            disabled={isRefreshing}
            className="min-h-9 px-3 py-1.5 text-xs"
            aria-label="Refresh balances"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              aria-hidden
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      ) : null}
      {balances.map((balance) => (
        <div
          key={`${balance.assetCode}-${balance.issuer ?? "native"}`}
          className="rounded-lg border border-white/80 bg-white/68 p-4 shadow-[4px_4px_0_rgba(142,220,244,0.22)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#172033]">{balance.assetCode}</p>
              <p className="mt-1 text-xs text-[#68758a]">
                {balance.issuer ? (
                  <CopyableValue label={`${balance.assetCode} issuer`} value={balance.issuer} />
                ) : (
                  "Native Stellar asset in the moon wallet"
                )}
              </p>
            </div>
            <Badge tone="info">{balance.amount}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
