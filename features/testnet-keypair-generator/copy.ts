import type { TestnetKeypairGeneratorErrorCode } from "@/features/testnet-keypair-generator/types";

export const copy = {
  formTitle: "Generate Keypair",
  formLabel: "Keypair Label (optional)",
  formHint:
    "Give this testnet keypair a descriptive label (e.g., 'Testing Alice'). Never enter private keys.",
  checkNetworkLabel: "Verify testnet status via Horizon",
  checkNetworkHint: "Checks testnet Horizon to verify this account is fresh and unfunded.",
  submit: "Generate Testnet Keypair",
  pending: "Generating...",
  emptyTitle: "No Keypair Generated Yet",
  emptyDescription:
    "Click generate to create a fresh, cryptographically secure Ed25519 keypair for Stellar Testnet with safety guidelines.",
  resultTitle: "Generated Testnet Keypair",
  publicKeyLabel: "Public Key (Account ID)",
  secretSeedLabel: "Secret Seed (Private Key)",
  networkLabel: "Target Network",
  ledgerStatusLabel: "Ledger Status",
  labelFieldLabel: "Label",
  generatedAtLabel: "Generated At",
  friendbotLabel: "Friendbot Funding",
  securityAlertTitle: "Testnet Only - Security Notice",
  securityAlertDescription:
    "This keypair was generated client-side in your browser for Stellar Testnet development. Never use this secret seed on Mainnet and never send real assets to this account.",
  revealSecret: "Reveal Secret Seed",
  hideSecret: "Hide Secret Seed",
  copyPublicKey: "Copy Public Key",
  copySecretSeed: "Copy Secret Seed",
  copyJson: "Copy JSON",
  downloadJson: "Download JSON",
  fundWithFriendbot: "Fund with Friendbot",
  statusUnfunded: "Fresh (Unfunded on Testnet)",
  statusFunded: "Existing Account (Funded)",
  statusSkipped: "Network Check Skipped",
  rawExportTitle: "Raw JSON Export"
} as const;

export const errorCopy: Record<
  TestnetKeypairGeneratorErrorCode,
  { title: string; description: string }
> = {
  secret_input_prohibited: {
    title: "Secret key prohibited",
    description:
      "Never paste or input private secret keys. Clear the input field and generate a fresh keypair instead."
  },
  label_too_long: {
    title: "Label is too long",
    description: "Please limit the keypair label to 50 characters or fewer."
  },
  horizon_unavailable: {
    title: "Testnet Horizon unavailable",
    description:
      "The Stellar Testnet Horizon server could not be reached. Check your connection or uncheck network verification."
  },
  rate_limited: {
    title: "Rate limit reached",
    description:
      "The Testnet Horizon server is temporarily rate limiting requests. Please wait a few moments before trying again."
  },
  request_failed: {
    title: "Verification request failed",
    description:
      "The request to check the account on testnet failed. Try generating without network verification or try again shortly."
  }
};
