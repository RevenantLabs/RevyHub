import { Diff } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "account-snapshot-diff",
  title: "Account Snapshot Difference Viewer",
  description:
    "Compare two saved Horizon account snapshots offline — balances, signers, thresholds and data entries — with exact deltas and no guessing at what happened in between.",
  character: "An archivist lays two ledgers open and marks only the lines that moved.",
  category: "accounts",
  status: "working",
  icon: Diff,
  networks: [],
  offline: true,
  keywords: [
    "account",
    "snapshot",
    "diff",
    "compare",
    "balances",
    "signers",
    "thresholds",
    "horizon",
    "json"
  ]
};
