import { Timer } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "ledger-close-cadence",
  title: "Ledger Close Cadence Explorer",
  description:
    "Measure observed spacing between recent ledger close timestamps and separate sequence gaps from long intervals.",
  character: "A metronome clerk times each ledger close and notes when a beat goes missing.",
  category: "network",
  status: "working",
  icon: Timer,
  networks: ["testnet", "mainnet"],
  keywords: [
    "ledger",
    "close time",
    "cadence",
    "interval",
    "sequence gap",
    "horizon",
    "network"
  ]
};
