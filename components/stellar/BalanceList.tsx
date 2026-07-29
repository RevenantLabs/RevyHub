import { Badge } from "@/components/ui/Badge";
import { CopyableValue } from "@/components/stellar/CopyableValue";

export type BalanceType = "native" | "credit" | "liquidity_pool";

export interface DisplayBalance {
  assetCode: string;
  issuer?: string;
  amount: string;
  balanceType: BalanceType;
}

interface BalanceSection {
  key: BalanceType;
  title: string;
  description: string;
  balances: DisplayBalance[];
}

export function BalanceList({ balances }: { balances: DisplayBalance[] }) {
  const sections: BalanceSection[] = [
    {
      key: "native",
      title: "Native XLM",
      description: "The account’s native Stellar lumens balance.",
      balances: balances.filter((balance) => balance.balanceType === "native")
    },
    {
      key: "credit",
      title: "Credit assets",
      description: "Issued assets and their trustline balances.",
      balances: balances.filter((balance) => balance.balanceType === "credit")
    },
    {
      key: "liquidity_pool",
      title: "Liquidity pool shares",
      description: "Pool-share balances held by the account.",
      balances: balances.filter((balance) => balance.balanceType === "liquidity_pool")
    }
  ].filter((section): section is BalanceSection => section.balances.length > 0);

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <section key={section.key} className="space-y-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#68758a]">{section.title}</h3>
            <p className="text-xs text-[#68758a]">{section.description}</p>
          </div>
          <div className="space-y-3">
            {section.balances.map((balance, index) => (
              <div
                key={`${section.key}-${balance.assetCode}-${balance.issuer ?? "native"}-${index}`}
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
        </section>
      ))}
    </div>
  );
}
