import { ScanSearch } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "strkey-corruption-locator",
  title: "StrKey Corruption Locator",
  description:
    "Pinpoint a single mistyped character in a public Stellar StrKey by testing every alphabet substitution locally.",
  character: "A careful clerk circles the one letter that broke the checksum.",
  category: "developer",
  status: "working",
  icon: ScanSearch,
  networks: [],
  offline: true,
  keywords: ["strkey", "checksum", "typo", "corruption", "base32", "public key", "ocr"]
};
