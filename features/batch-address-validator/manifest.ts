import { ListChecks } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "batch-address-validator",
  title: "Bulk Address Validator",
  description:
    "Validate a whole list of Stellar addresses at once and see per-line results with a summary of what failed and why.",
  character: "A star clerk reads down a long payout scroll and stamps each row pass or fail.",
  category: "payments",
  status: "working",
  icon: ListChecks,
  networks: [],
  offline: true,
  keywords: ["batch", "bulk", "address", "validate", "list", "airdrop", "payout", "strkey"]
};
