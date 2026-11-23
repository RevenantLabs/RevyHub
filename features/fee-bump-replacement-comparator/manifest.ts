import { ArrowLeftRight } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "fee-bump-replacement-comparator",
  title: "Fee-Bump Replacement Comparator",
  description:
    "Compare two fee-bump envelopes that should wrap the same inner transaction and see whether only the outer fee terms differ.",
  character:
    "A clerk holds two stamped wrappers over the same letter and checks that only the postage changed.",
  category: "transactions",
  status: "working",
  icon: ArrowLeftRight,
  networks: [],
  offline: true,
  keywords: [
    "fee bump",
    "replacement",
    "compare",
    "envelope",
    "xdr",
    "inner transaction",
    "fee source",
    "mempool"
  ]
};
