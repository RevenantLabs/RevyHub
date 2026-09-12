import { ArrowLeftRight } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

/** Manifest metadata for the Classic Asset Descriptor and XDR Codec tool. */
export const manifest: FeatureManifest = {
  slug: "asset-descriptor-codec",
  title: "Classic Asset Descriptor and XDR Codec",
  description:
    "Convert native and issued asset descriptors to canonical text, structured JSON, and Asset XDR, with reversible decoding back from XDR.",
  character: "A meticulous clerk encodes and decodes Stellar asset identities without dialing out.",
  category: "assets",
  status: "working",
  icon: ArrowLeftRight,
  networks: [],
  offline: true,
  keywords: [
    "asset",
    "descriptor",
    "xdr",
    "codec",
    "stellar",
    "native",
    "alphanum4",
    "alphanum12",
    "offline"
  ]
};
