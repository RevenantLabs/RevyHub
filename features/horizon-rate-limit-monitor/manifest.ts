import { Gauge } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";
export const manifest: FeatureManifest = {
  slug: "horizon-rate-limit-monitor", title: "Horizon Rate Limit Monitor",
  description: "Read per-endpoint Horizon request quotas and reset countdowns before the quota runs low.",
  character: "A network lookout watches each gate's remaining capacity.",
  category: "network", status: "working", icon: Gauge,
  networks: ["testnet", "mainnet"], keywords: ["horizon", "rate limit", "quota", "headers", "reset"]
};
