import { Scale } from "lucide-react";
import type { FeatureManifest } from "@/core/registry/types";

export const manifest: FeatureManifest = {
  slug: "transaction-balance-change-reconciler",
  title: "Transaction Balance Change Reconciler",
  description:
    "Turn before/after ledger-entry changes in transaction metadata into a per-account, per-asset balance report with an explicit reconciliation residual.",
  character:
    "An auditor lays three XDR slips on the desk — envelope, result, metadata — and refuses to call anything a payment until the residual is zero.",
  category: "transactions",
  status: "working",
  icon: Scale,
  networks: [],
  offline: true,
  keywords: [
    "balance",
    "reconcile",
    "delta",
    "residual",
    "metadata",
    "ledger entry",
    "trustline",
    "fee",
    "xdr",
    "offline"
  ]
};
