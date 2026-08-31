import { Tags } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "memo-inspector",
  title: "Memo Encoder and Decoder",
  description:
    "Build any of the five Stellar memo types in your browser and read the exact bytes a transaction would carry, with the real limits enforced.",
  character: "A meticulous sorter weighs every memo in bytes before letting it onto the ledger.",
  category: "transactions",
  status: "working",
  icon: Tags,
  networks: [],
  offline: true,
  keywords: [
    "memo",
    "memo text",
    "memo id",
    "memo hash",
    "memo return",
    "xdr",
    "exchange deposit",
    "28 bytes",
    "encode",
    "decode"
  ]
};
