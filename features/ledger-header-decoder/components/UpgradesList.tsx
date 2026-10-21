import { Card, CardDescription, CardHeader, CardTitle } from "@/core/ui/Card";
import { DataList } from "@/core/ui/DataList";
import { copy } from "@/features/ledger-header-decoder/copy";
import { formatUpgradeType } from "@/features/ledger-header-decoder/lib/format";
import type { UpgradeSummary } from "@/features/ledger-header-decoder/types";

export function UpgradesList({ upgrades }: { upgrades: UpgradeSummary[] }) {
  return <Card>
    <CardHeader><CardTitle>{copy.upgradesTitle}</CardTitle><CardDescription>{copy.upgradesDescription}</CardDescription></CardHeader>
    {upgrades.length === 0 ? <p>{copy.noUpgrades}</p> :
      <ol className="space-y-3">{upgrades.map((upgrade, index) =>
        <li key={index} className="rounded-md border border-[#e3ebf5] p-3">
          <h3 className="font-semibold">{formatUpgradeType(upgrade)}</h3>
          <DataList items={upgrade.value === null
            ? [{ label: copy.rawBytes, value: upgrade.rawHex, mono: true }]
            : [{ label: copy.upgradeTypes[upgrade.type], value: upgrade.value, mono: true }]} />
        </li>)}</ol>}
  </Card>;
}
