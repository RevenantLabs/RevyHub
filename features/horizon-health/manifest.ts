import { Activity } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "horizon-health",
  title: "Horizon Endpoint Health Diagnostic",
  description:
    "Check the configured Horizon endpoint's version, ingestion lag, history range and rate-limit headroom, and say plainly whether it is usable right now.",
  character:
    "A site reliability engineer inspects the Horizon telemetry to ensure ledger ingestion is current.",
  category: "network",
  status: "working",
  icon: Activity,
  networks: ["testnet", "mainnet"],
  keywords: [
    "horizon",
    "health",
    "diagnostic",
    "ingest",
    "lag",
    "ledger",
    "rate limit",
    "status"
  ]
};
