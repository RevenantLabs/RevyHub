import type { NetworkErrorCode } from "@/features/network-passphrase-inspector/types";

export const copy = {
  formLabel: "Search networks",
  formHint: "Search by network name, type, or passphrase. Leave empty to browse all.",
  submit: "Search",
  loading: "Searching...",
  emptyTitle: "No network selected",
  emptyDescription: "Browse Stellar network passphrases, Horizon URLs, and RPC endpoints.",
  resultTitle: "Network Information",
  nameLabel: "Network Name",
  typeLabel: "Type",
  passphraseLabel: "Passphrase",
  horizonLabel: "Horizon URL",
  rpcLabel: "Soroban RPC",
  sorobanLabel: "Soroban Enabled",
  enabled: "Yes",
  disabled: "No",
  default: "Default",
  allTypes: "All Networks",
} as const;

export const errorCopy: Record<
  NetworkErrorCode,
  { title: string; description: string }
> = {
  empty_input: { title: "Enter a search term", description: "Search by name, type, or passphrase." },
  invalid_passphrase: { title: "Invalid passphrase", description: "The passphrase format is not recognized." },
  network_not_found: { title: "Network not found", description: "No matching networks found." },
};
