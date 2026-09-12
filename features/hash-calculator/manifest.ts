import { Hash } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

/** Manifest metadata for the Stellar Hash Calculator feature slice. */
export const manifest: FeatureManifest = {
  slug: "hash-calculator",
  title: "Stellar Hash Calculator",
  description:
    "Compute SHA-256 hashes of arbitrary input and derive transaction hashes from an XDR envelope and network passphrase.",
  character:
    "A meticulous cryptographic analyst verifies hashes and explains how network passphrases shape transaction identities.",
  category: "keys",
  status: "working",
  icon: Hash,
  networks: [],
  offline: true,
  keywords: [
    "hash",
    "sha256",
    "transaction",
    "xdr",
    "passphrase",
    "envelope",
    "testnet",
    "mainnet"
  ]
};
