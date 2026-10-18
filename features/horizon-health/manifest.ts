import { Activity } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";
export const manifest: FeatureManifest = {
 slug: "horizon-health", title: "Horizon Endpoint Health Diagnostic",
 description: "Inspect Horizon ingestion lag, retained history, versions and rate-limit headers.",
 character: "Check the trail before trusting the tracks.", category: "network", status: "beta", icon: Activity,
 networks: ["testnet", "mainnet"], keywords: ["horizon", "health", "ingestion", "lag", "rate limit", "history"]
};
