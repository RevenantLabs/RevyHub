import { Route } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";
export const manifest: FeatureManifest = {
  slug: "path-payment-slippage-calculator", title: "Path Payment Slippage Calculator",
  description: "Audit realized path-payment execution against its declared bound.", character: "Follow every hop; measure every stroop.",
  category: "payments", status: "beta", icon: Route, networks: ["testnet", "mainnet"],
  keywords: ["path payment", "slippage", "strict send", "strict receive"]
};
