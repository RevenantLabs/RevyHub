import { FileSearch } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "xdr-inspector",
  title: "Transaction XDR Inspector",
  description:
    "Decode a base64 transaction envelope in your browser and read its source, fee, sequence, preconditions, memo, operations and signatures.",
  character: "A quiet archivist unfolds an envelope and reads it aloud, without posting it.",
  category: "transactions",
  status: "working",
  icon: FileSearch,
  networks: [],
  offline: true,
  keywords: ["xdr", "envelope", "decode", "base64", "fee bump", "preconditions", "operations"]
};
