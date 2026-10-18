import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import type { StellarNetwork } from "@/core/network/types";

/**
 * Categories group tools on the dashboard and in the sidebar.
 * Adding a category is a core change; picking one is a feature change.
 */
export const FEATURE_CATEGORIES = [
  "accounts",
  "assets",
  "payments",
  "transactions",
  "soroban",
  "network",
  "keys",
  "standards",
  "developer"
] as const;

export type FeatureCategory = (typeof FEATURE_CATEGORIES)[number];

export const FEATURE_CATEGORY_LABELS: Record<FeatureCategory, string> = {
  accounts: "Accounts",
  assets: "Assets & Trustlines",
  payments: "Payments",
  transactions: "Transactions",
  soroban: "Soroban",
  network: "Network & Infrastructure",
  keys: "Keys & Encoding",
  standards: "Stellar Standards (SEPs)",
  developer: "Developer Utilities"
};

export type FeatureStatus = "working" | "beta" | "experimental";

/**
 * The public contract of a feature slice.
 *
 * Every directory under `features/` MUST export a `manifest` shaped like this
 * from `features/<slug>/manifest.ts`. The registry is generated from these
 * files, so no shared file has to be edited when a feature is added.
 */
export interface FeatureManifest {
  /** URL segment under /tools/. Must match the directory name. */
  slug: string;
  /** Human-readable tool name shown in navigation and headings. */
  title: string;
  /** One sentence describing what the tool does. */
  description: string;
  /** Short in-world character line used by the anthropomorphic UI. */
  character: string;
  category: FeatureCategory;
  status: FeatureStatus;
  /** Lucide icon component used for cards and navigation. */
  icon: LucideIcon;
  /** Networks the tool supports. Local-only tools use an empty array. */
  networks: readonly StellarNetwork[];
  /** Search keywords for the command palette and dashboard filtering. */
  keywords: readonly string[];
  /** True when the tool performs no network requests at all. */
  offline?: boolean;
}

export interface FeatureEntry {
  manifest: FeatureManifest;
  Panel: ComponentType;
}
