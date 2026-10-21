import { StickyNote } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "memo-required-checker",
  title: "SEP-29 Memo Required Checker",
  description:
    "Check a destination account's SEP-29 config.memo_required data entry and its home-domain stellar.toml before sending a payment.",
  character: "A clerk who reads both notices and still calls the result a best effort.",
  category: "standards",
  status: "working",
  icon: StickyNote,
  networks: ["testnet", "mainnet"],
  keywords: ["sep-29", "memo required", "config.memo_required", "stellar.toml"]
};
