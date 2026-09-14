import { ShieldCheck } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "sep12-kyc-reference",
  title: "SEP-12 KYC Field Reference",
  description:
    "Browse SEP-12 KYC field types, their descriptions, data requirements, and validation rules — fully offline.",
  character: "Every field tells a story about who you are and what you need to prove.",
  category: "stellar",
  status: "working",
  icon: ShieldCheck,
  networks: [],
  offline: true,
  keywords: ["sep-12", "kyc", "fields", "reference", "stellar", "regulation"],
};
