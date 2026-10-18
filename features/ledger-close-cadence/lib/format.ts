import type { StellarNetwork } from "@/core/network/types";

const NETWORK_LABELS: Record<StellarNetwork, string> = {
  testnet: "Testnet",
  mainnet: "Mainnet"
};

export function formatNetworkLabel(network: StellarNetwork): string {
  return NETWORK_LABELS[network];
}

export function formatDurationMs(durationMs: number): string {
  if (!Number.isFinite(durationMs)) return "—";

  const absolute = Math.abs(Math.trunc(durationMs));
  const sign = durationMs < 0 ? "-" : "";

  if (absolute < 1000) {
    return `${sign}${absolute} ms`;
  }

  const wholeSeconds = Math.floor(absolute / 1000);
  const millis = absolute % 1000;

  if (wholeSeconds < 60) {
    return millis === 0
      ? `${sign}${wholeSeconds} s`
      : `${sign}${wholeSeconds}.${String(millis).padStart(3, "0")} s`;
  }

  const minutes = Math.floor(wholeSeconds / 60);
  const seconds = wholeSeconds % 60;
  return `${sign}${minutes} m ${seconds} s`;
}

export function formatLedgerLabel(sequence: string, closedAt: string): string {
  return `#${sequence} · ${closedAt}`;
}

export function formatCount(value: number): string {
  return String(value);
}
