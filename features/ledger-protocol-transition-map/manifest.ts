import { Map as MapIcon } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "ledger-protocol-transition-map",
  title: "Ledger Protocol Transition Map",
  description:
    "Scan a bounded ledger range and map where Horizon-reported protocol versions change.",
  character: "A cartographer marks every protocol upgrade on a short stretch of ledger road.",
  category: "network",
  status: "working",
  icon: MapIcon,
  networks: ["testnet", "mainnet"],
  keywords: ["ledger", "protocol", "upgrade", "transition", "horizon", "version"]
};
