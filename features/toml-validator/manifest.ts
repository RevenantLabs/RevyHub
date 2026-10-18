import { Sparkles } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "toml-validator",
  title: "stellar.toml Validator",
  description: "Validate SEP-1 stellar.toml fields, currency issuers and fetched CORS metadata.",
  character: "A meticulous document clerk flags missing fields before publication.",
  category: "standards",
  status: "beta",
  icon: Sparkles,
  networks: ["testnet", "mainnet"],
  keywords: ["stellar.toml", "sep-1", "validator", "issuer", "cors"]
};
