import { History } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "soroban-restore-readiness",
  title: "Soroban Storage Restore Readiness",
  description:
    "Check whether a contract's storage entry is live, past its live-until ledger but not yet evicted, or fully archived, and what restoring it would require.",
  character: "An archivist who checks the shelf before promising to fetch the box.",
  category: "soroban",
  status: "beta",
  icon: History,
  networks: ["testnet", "mainnet"],
  keywords: ["soroban", "ttl", "archival", "restore", "getLedgerEntries"]
};
