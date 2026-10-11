import { Database } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "contract-storage",
  title: "Contract Storage and TTL Inspector",
  description:
    "Read a Soroban contract's instance storage and TTL from an RPC node and see how long each entry has before it expires.",
  character: "A careful librarian reads the contract's ledgers and tells you when each page turns to dust.",
  category: "soroban",
  status: "beta",
  icon: Database,
  networks: ["testnet", "mainnet"],
  keywords: [
    "contract",
    "storage",
    "ttl",
    "soroban",
    "ledger entries",
    "instance storage",
    "expiration"
  ]
};
