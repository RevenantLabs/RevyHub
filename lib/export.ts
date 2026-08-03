import type { StellarNetwork } from "@/lib/stellar/horizon";
import type { DisplayBalance } from "@/components/stellar/BalanceList";

export interface BalanceSnapshot {
  network: StellarNetwork;
  publicKey: string;
  exportedAt: string;
  balances: DisplayBalance[];
}

/**
 * Create a deterministic, filesystem-safe filename for a balance snapshot.
 * Example: revyhubx-balances-testnet-GABCDEFG-2026-07-28.json
 */
export function getExportFilename(network: StellarNetwork, publicKey: string): string {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const shortKey = publicKey.slice(0, 8);
  return `revyhubx-balances-${network}-${shortKey}-${date}.json`;
}

/**
 * Generate a JSON blob from the current balance snapshot.
 */
export function createBalanceSnapshot(
  network: StellarNetwork,
  publicKey: string,
  balances: DisplayBalance[]
): Blob {
  const snapshot: BalanceSnapshot = {
    network,
    publicKey,
    exportedAt: new Date().toISOString(),
    balances
  };

  return new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
}

/**
 * Trigger a file download in the browser.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
