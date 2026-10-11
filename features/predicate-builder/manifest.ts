import { Workflow } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "predicate-builder",
  title: "Claimable Balance Predicate Builder",
  description:
    "Build claim predicates visually with AND, OR, NOT, and time conditions. See a plain-language preview and generate XDR — all in your browser.",
  character:
    "A careful architect assembles time locks and logical gates, making predicates visual and difficult to get wrong.",
  category: "transactions",
  status: "working",
  icon: Workflow,
  networks: [],
  offline: true,
  keywords: [
    "claimable balance",
    "predicate",
    "claim predicate",
    "and",
    "or",
    "not",
    "time condition",
    "xdr",
    "encode"
  ]
};
