import { Fingerprint } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "contract-code-hash-verifier",
  title: "Contract Code Hash Verifier",
  description: "Compare a contract instance Wasm hash with SHA-256 of the code entry returned by Soroban RPC.",
  character: "A clerk who weighs the mould against the type it claims to hold.",
  category: "soroban",
  status: "beta",
  icon: Fingerprint,
  networks: ["testnet", "mainnet"],
  keywords: ["soroban", "wasm", "contract code", "hash", "getLedgerEntries"]
};
