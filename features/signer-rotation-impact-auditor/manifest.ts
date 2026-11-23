import { ShieldAlert } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "signer-rotation-impact-auditor",
  title: "Signer Rotation Impact Auditor",
  description:
    "Compare a Horizon account signer snapshot with a proposed set-options rotation and see which authorization thresholds become unreachable after each step.",
  character:
    "A clerk walks the proposed key hand-off step by step and stops at the first door that no longer opens.",
  category: "accounts",
  status: "working",
  icon: ShieldAlert,
  networks: [],
  offline: true,
  keywords: [
    "signer",
    "rotation",
    "multisig",
    "threshold",
    "set options",
    "lockout",
    "master weight",
    "account"
  ]
};
