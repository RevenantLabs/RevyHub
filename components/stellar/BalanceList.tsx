import { Badge } from "@/components/ui/Badge";
import { CopyableValue } from "@/components/stellar/CopyableValue";
import { formatAssetAmount } from "@/lib/stellar/assetAmount";

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
        // Display a trimmed, easy-to-read amount while preserving the raw
        // Horizon value on the badge's title (hover tooltip) so reviewers can
        // still audit the full seven-decimal precision.
        const formattedAmount = formatAssetAmount(balance.amount);
        const amountLabel =
          formattedAmount === balance.amount
            ? "Stellar balance"
            : `Stellar balance (raw: ${balance.amount})`;

        return (
          <div
            key={`${balance.assetCode}-${balance.issuer ?? "native"}`}
            className="rounded-lg border border-white/80 bg-white/68 p-4 shadow-[4px_4px_0_rgba(142,220,244,0.22)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#172033]">
                  {balance.assetCode}
                </p>
                <p className="mt-1 text-xs text-[#68758a]">
                  {balance.issuer ? (
                    <CopyableValue
                      label={`${balance.assetCode} issuer`}
                      value={balance.issuer}
                    />
                  ) : (
                    "Native Stellar asset in the moon wallet"
                  )}
                </p>
              </div>
              <Badge tone="info" title={amountLabel}>
                {formattedAmount}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
