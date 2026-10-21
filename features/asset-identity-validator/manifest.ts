import { BadgeCheck } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "asset-identity-validator",
  title: "Asset Code & Issuer Identity Validator",
  description:
    "Check a classic asset code and issuer against Stellar's identity rules and show the canonical code:issuer string, without asking the network whether the asset exists.",
  character: "A clerk stamps the code and the issuer into one canonical line, and refuses a secret key on sight.",
  category: "developer",
  status: "working",
  icon: BadgeCheck,
  networks: [],
  offline: true,
  keywords: [
    "asset",
    "code",
    "issuer",
    "alphanum4",
    "alphanum12",
    "canonical",
    "XLM",
    "identity",
    "credit"
  ]
};
