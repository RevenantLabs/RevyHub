import { Layers } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "ledger-lookup",
  title: "Ledger Lookup",
  description: "Look up a Stellar ledger by sequence number to inspect its close time, transactions, fee pool and protocol version.",
  character: "A ledger archivist retrieves historical blocks and inspects their network parameters.",
  category: "network",
  status: "beta",
  icon: Layers,
  networks: ["testnet", "mainnet"],
  keywords: ["ledger", "sequence", "horizon", "block", "protocol", "fee pool", "close time"]
};
