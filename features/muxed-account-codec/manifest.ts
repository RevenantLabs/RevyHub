import { ArrowLeftRight } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "muxed-account-codec",
  title: "Muxed Account Encoder and Decoder",
  description:
    "Encode and decode Stellar multiplexed accounts (SEP-0023 M-addresses) to and from base G-addresses and 64-bit routing IDs.",
  character: "A meticulous account clerk splits and combines multiplexed routing identifiers.",
  category: "keys",
  status: "working",
  icon: ArrowLeftRight,
  networks: [],
  offline: true,
  keywords: [
    "muxed-account-codec",
    "muxed",
    "multiplexed",
    "sep-0023",
    "m-address",
    "g-address",
    "encoder",
    "decoder"
  ]
};
