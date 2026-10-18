import type { AddressKind } from "@/features/address-validator/types";

const KIND_LABELS: Record<AddressKind, string> = {
  ed25519_public_key: "Ed25519 public key (account)",
  muxed_account: "Muxed account (M-address)",
  contract: "Contract address",
  ed25519_secret_seed: "Secret seed",
  pre_auth_tx: "Pre-authorized transaction hash",
  sha256_hash: "SHA-256 hash (hashX signer)",
  signed_payload: "Signed payload signer",
  unknown: "Unrecognised value"
};

export function formatKind(kind: AddressKind): string {
  return KIND_LABELS[kind];
}

export function formatLength(length: number): string {
  return `${length} character${length === 1 ? "" : "s"}`;
}
