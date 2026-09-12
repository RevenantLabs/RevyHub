import { IdCard } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "sep12-fields",
  title: "SEP-12 KYC Field Reference",
  description:
    "Search the SEP-9 field names and types that SEP-12 anchors ask for, grouped by natural person, organization and financial account, with every canonical name copyable.",
  character:
    "A consulate clerk keeps the list of questions an anchor is allowed to ask, and insists on the exact wording.",
  category: "standards",
  status: "beta",
  icon: IdCard,
  networks: [],
  offline: true,
  keywords: ["sep-12", "sep-9", "kyc", "field", "anchor", "customer", "reference"]
};
