import { AtSign } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "federation-resolver",
  title: "Federation Address Resolver",
  description:
    "Resolve a SEP-0002 federated address such as alice*example.com to its Stellar account, memo type and memo.",
  character: "A switchboard operator who knows which extension a name rings through to.",
  category: "standards",
  status: "working",
  icon: AtSign,
  networks: [],
  keywords: ["federation", "sep-0002", "stellar.toml", "name*domain", "memo", "resolve"]
};
