import { ShieldCheck } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";
export const manifest: FeatureManifest = {
  slug: "soroban-auth-nonce-expiry-auditor",
  title: "Soroban Auth Nonce and Expiry Auditor",
  description: "Inspect pasted Soroban authorization XDR for repeated address nonces and ledger expiry.",
  character: "An auditor checks every authorization against the supplied ledger and network.",
  category: "soroban", status: "working", icon: ShieldCheck,
  networks: [], offline: true, keywords: ["soroban", "authorization", "nonce", "expiry", "xdr"]
};
