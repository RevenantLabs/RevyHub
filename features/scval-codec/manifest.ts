import { Sparkles } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "scval-codec",
  title: "ScVal Encoder and Decoder",
  description: "Convert Soroban ScVal values between base64 XDR and readable JSON.",
  character: "Every contract speaks in ScVal — here is the universal translator.",
  category: "soroban",
  status: "beta",
  icon: Sparkles,
  networks: [],
  offline: true,
  keywords: ["scval", "xdr", "encode", "decode", "soroban", "codec"]
};
