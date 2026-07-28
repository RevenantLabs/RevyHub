import { Badge } from "@/components/ui/Badge";
import { CopyableValue } from "@/components/stellar/CopyableValue";
import { formatAssetAmount } from "@/lib/stellar/formatAmount";

export interface DisplayBalance {
  assetCode: string;
  issuer?: string;
  amount: string;
}

export function BalanceList({ balances }: { balances: DisplayBalance[] }) {
  return (
    <div className="space-y-3">
      {/* TODO(issue #4): Improve asset grouping, precision formatting, and empty/liquidity-pool display states. */}
      {balances.map((balance) => {
        const formatted = formatAssetAmount(balance.amount, 20);
        return (
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
              <Badge tone="info" className="inline-flex items-center gap-2">
                {/* show a formatted, compacted display, but make the raw amount copyable */}
                <CopyableValue
                  label={`${balance.assetCode} amount`}
                  value={formatted.raw}
                  display={formatted.display}
                  visible={formatted.display.length + 2}
                />
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
