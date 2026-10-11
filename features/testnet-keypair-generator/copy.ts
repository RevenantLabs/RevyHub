import type { KeypairErrorCode } from "@/features/testnet-keypair-generator/types";

export const copy = {
  formLabel: "Seed (optional)",
  formHint: "Paste a seed starting with S to derive its public key, or leave empty to generate a new keypair.",
  submit: "Generate",
  loading: "Generating...",
  emptyTitle: "No keypair generated yet",
  emptyDescription: "Generate a new testnet keypair or derive a public key from an existing seed.",
  resultTitle: "Generated Keypair",
  publicKeyLabel: "Public Key (G...)",
  seedLabel: "Seed (S...)",
  copyPublic: "Copy Public Key",
  copySeed: "Copy Seed",
  copied: "Copied!",
  securityNote: "Never share your seed. This tool runs entirely offline.",
} as const;

export const errorCopy: Record<
  KeypairErrorCode,
  { title: string; description: string }
> = {
  empty_input: { title: "Enter a seed or generate new", description: "Paste a seed or leave empty for a new keypair." },
  invalid_seed: { title: "Invalid seed", description: "The seed must start with S and be a valid Stellar seed." },
  invalid_public_key: { title: "Invalid public key", description: "The public key must start with G." },
};
