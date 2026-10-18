import { ListFilter } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";
export const manifest: FeatureManifest = {
  slug: "muxed-payment-routing-audit",
  title: "Muxed Payment Routing Audit",
  description: "Group recent incoming payments by destination muxed ID and inspect direct base-address payments.",
  character: "Trace each payment to the route actually named on chain.",
  category: "payments",
  status: "beta",
  icon: ListFilter,
  networks: ["testnet", "mainnet"],
  keywords: ["muxed", "payment", "routing", "audit", "Horizon"]
};
