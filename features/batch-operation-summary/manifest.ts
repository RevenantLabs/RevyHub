import { ListTree } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "batch-operation-summary",
  title: "Batch Operation Summary",
  description: "Decode a transaction envelope and audit all operations, native value and source accounts.",
  character: "One envelope, every operation accounted for.",
  category: "transactions",
  status: "beta",
  icon: ListTree,
  networks: [],
  offline: true,
  keywords: ["xdr", "operations", "batch", "source", "xlm"]
};
