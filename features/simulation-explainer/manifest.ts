import { Activity } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "simulation-explainer",
  title: "Soroban Simulation Result Explainer",
  description:
    "Simulate a pasted Soroban transaction envelope against RPC and explain the result: fees, resources, auth entries, or why it failed.",
  character: "A fortune-teller reads the transaction before it is sent, revealing the cost and the consequences.",
  category: "soroban",
  status: "beta",
  icon: Activity,
  networks: ["testnet", "mainnet"],
  keywords: [
    "soroban",
    "simulation",
    "simulate",
    "transaction",
    "fees",
    "resources",
    "xdr",
    "auth"
  ]
};
