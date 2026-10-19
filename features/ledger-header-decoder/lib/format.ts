import { copy } from "@/features/ledger-header-decoder/copy";
import type { UpgradeSummary } from "@/features/ledger-header-decoder/types";

/** Unix time points are integer seconds; preserve the original value if Date cannot represent it. */
export function formatCloseTime(seconds: string): string {
  const milliseconds = BigInt(seconds) * 1000n;
  if (milliseconds > BigInt(8_640_000_000_000_000)) return `${seconds} ${copy.utcSecondsUnit}`;
  const date = new Date(Number(milliseconds));
  return Number.isNaN(date.getTime()) ? `${seconds} ${copy.utcSecondsUnit}` : date.toISOString().replace("T", " ").replace(".000Z", " UTC");
}

export function formatStroops(value: string): string { return `${value} ${copy.stroopsUnit}`; }
export function formatUpgradeType(upgrade: UpgradeSummary): string {
  return upgrade.type === "unrecognized"
    ? `${copy.unrecognized} (${upgrade.typeNumber})`
    : copy.upgradeTypes[upgrade.type];
}
