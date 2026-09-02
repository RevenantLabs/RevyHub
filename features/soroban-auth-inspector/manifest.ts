import { ShieldCheck } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "soroban-auth-inspector",
  title: "Soroban Authorization Entry Inspector",
  description:
    "Decode the authorization entries attached to a Soroban invocation and render the authorisation tree: who must sign, for which sub-invocation, under which nonce and expiry.",
  character:
    "A watchful sentinel unfolds the nested parchment of signatures, revealing every hidden clause before the signer lifts their pen.",
  category: "soroban",
  status: "beta",
  icon: ShieldCheck,
  networks: [],
  offline: true,
  keywords: ["soroban", "authorization", "auth", "signature", "invocation", "xdr", "security"]
};
