import { ShieldCheck } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "sep7-request-policy-auditor",
  title: "SEP-0007 Request Policy Auditor",
  description: "Audit a pasted Stellar payment-request URI against a local destination, amount, asset and callback policy.",
  character: "A clerk who reads a payment slip and stamps each line before anyone follows a link.",
  category: "standards",
  status: "beta",
  icon: ShieldCheck,
  networks: [],
  offline: true,
  keywords: ["sep-0007", "sep7", "payment request", "policy", "callback"]
};
