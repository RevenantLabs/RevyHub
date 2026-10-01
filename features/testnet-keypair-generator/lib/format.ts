import { copy } from "@/features/testnet-keypair-generator/copy";
import type {
  NetworkCheckStatus,
  TestnetKeypairGeneratorResult
} from "@/features/testnet-keypair-generator/types";

/**
 * Presentation-only helpers for keypair generator.
 */

export function maskSecret(secret: string): string {
  if (!secret) return "";
  if (secret.length <= 4) return "••••";
  return secret.slice(0, 1) + "•".repeat(secret.length - 1);
}

export function formatNetworkStatus(status: NetworkCheckStatus): string {
  switch (status) {
    case "unfunded":
      return copy.statusUnfunded;
    case "funded":
      return copy.statusFunded;
    case "skipped":
      return copy.statusSkipped;
  }
}

export function formatKeypairExportJson(result: TestnetKeypairGeneratorResult): string {
  return JSON.stringify(
    {
      network: result.network,
      label: result.label ?? null,
      publicKey: result.publicKey,
      secretSeed: result.secretSeed,
      friendbotUrl: result.friendbotUrl,
      networkCheckStatus: result.networkCheckStatus,
      generatedAt: result.generatedAt,
      securityNotice: copy.securityAlertDescription
    },
    null,
    2
  );
}

export function formatKeypairExportText(result: TestnetKeypairGeneratorResult): string {
  const lines = [
    `=== Stellar Testnet Keypair ===`,
    `Network: ${result.network}`,
    result.label ? `Label: ${result.label}` : null,
    `Public Key: ${result.publicKey}`,
    `Secret Seed: ${result.secretSeed}`,
    `Ledger Status: ${formatNetworkStatus(result.networkCheckStatus)}`,
    `Friendbot URL: ${result.friendbotUrl}`,
    `Generated At: ${result.generatedAt}`,
    `Notice: ${copy.securityAlertDescription}`
  ].filter(Boolean);

  return lines.join("\n");
}
