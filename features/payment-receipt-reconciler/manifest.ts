import { Receipt } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "payment-receipt-reconciler",
  title: "Payment Receipt Reconciler",
  description:
    "Turn a completed payment or path-payment into a receipt that links operations to debit and credit effects.",
  character: "A careful clerk stamps each debit and credit onto one public receipt.",
  category: "payments",
  status: "working",
  icon: Receipt,
  networks: ["testnet", "mainnet"],
  keywords: [
    "payment",
    "path payment",
    "receipt",
    "effects",
    "debit",
    "credit",
    "reconcile",
    "horizon",
    "fee"
  ]
};
