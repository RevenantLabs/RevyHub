/**
 * Tool Registry
 *
 * This module serves as the single source of truth for all tool metadata.
 * All tool-related information (names, routes, descriptions, icons, status, categories)
 * should be defined here and consumed by other components.
 *
 * HOW TO ADD A NEW TOOL:
 *
 * 1. Add a new entry to the `tools` array below with the following properties:
 *    - title: Display name for the tool
 *    - description: Brief description of what the tool does
 *    - character: A description of the tool's personality/character
 *    - href: The route path (must match the app/tools/[slug]/page.tsx route)
 *    - status: "Working" | "MVP" | "Coming Soon"
 *    - category: "validation" | "balances" | "network"
 *    - icon: A Lucide React icon component
 *
 * 2. Create the corresponding page in app/tools/[your-tool-slug]/page.tsx
 *
 * 3. Import `tools` from this registry in any component that needs tool data
 *    (e.g., dashboard, sidebar, navigation)
 *
 * Note: No secret keys, seed phrases, or sensitive data should ever be stored here.
 */

import {
  AtSign,
  BadgeCheck,
  CircleDollarSign,
  Droplets,
  FileSearch,
  Gauge,
  QrCode,
  ScanSearch,
  Search,
  ShieldCheck,
  WalletCards,
  type LucideIcon
} from "lucide-react";

/**
 * Represents the availability status of a tool.
 */
export type ToolStatus = "Working" | "MVP" | "Coming Soon";

/**
 * Represents the category a tool belongs to on the dashboard.
 */
export type ToolCategory = "validation" | "balances" | "network";

/**
 * Display information for a tool category.
 */
export interface ToolCategoryInfo {
  label: string;
  description: string;
}

/**
 * Represents a tool in the registry with all its metadata.
 */
export interface Tool {
  /** Display name for the tool */
  title: string;
  /** Brief description of what the tool does */
  description: string;
  /** Description of the tool's personality/character */
  character: string;
  /** The route path (e.g., "/tools/address-validator") */
  href: string;
  /** Current development status */
  status: ToolStatus;
  /** Dashboard category */
  category: ToolCategory;
  /** Lucide React icon component */
  icon: LucideIcon;
}

/**
 * Maps tool status values to their display tone for badges.
 */
export const statusTone: Record<ToolStatus, "success" | "info" | "warning"> = {
  Working: "success",
  MVP: "info",
  "Coming Soon": "warning"
};

/**
 * Display metadata for each tool category.
 */
export const toolCategories: Record<ToolCategory, ToolCategoryInfo> = {
  validation: {
    label: "Validation & Security",
    description: "Check addresses, trustlines, and asset integrity."
  },
  balances: {
    label: "Balances & Transactions",
    description: "View balances, generate payments, and inspect transactions."
  },
  network: {
    label: "Network & Wallets",
    description: "Connect wallets, fund accounts, and interact with the network."
  }
};

/**
 * The centralized registry of all available tools.
 * This is the single source of truth for tool metadata.
 */
export const tools: Tool[] = [
  {
    title: "Address Validator",
    description: "Validate Stellar public keys and explain address format issues.",
    character: "A careful star clerk checks every public key badge.",
    href: "/tools/address-validator",
    status: "Working",
    category: "validation",
    icon: ShieldCheck
  },
  {
    title: "Trustline Checker",
    description: "Check whether an account trusts a specific issued asset.",
    character: "A tiny inspector looks for asset handshakes.",
    href: "/tools/trustline-checker",
    status: "MVP",
    category: "validation",
    icon: BadgeCheck
  },
  {
    title: "Balance Viewer",
    description: "Inspect account balances on the selected network through Horizon.",
    character: "A moon wallet opens its pockets for the selected network's balances.",
    href: "/tools/balance-viewer",
    status: "Working",
    category: "balances",
    icon: CircleDollarSign
  },
  {
    title: "Payment QR Generator",
    description: "Create demo Stellar payment request QR codes.",
    character: "A rocket assistant frames payment details as a QR poster.",
    href: "/tools/payment-qr",
    status: "Working",
    category: "balances",
    icon: QrCode
  },
  {
    title: "Transaction Lookup",
    description: "Look up transactions by hash on the selected network.",
    character: "A detective comet follows transaction trails through Horizon.",
    href: "/tools/transaction-lookup",
    status: "MVP",
    category: "balances",
    icon: Search
  },
  {
    title: "XDR Inspector",
    description: "Decode transaction envelope XDR locally, without any network calls.",
    character: "A lens-eyed archivist unrolls transaction scrolls without leaving the library.",
    href: "/tools/xdr-inspector",
    status: "Working",
    category: "validation",
    icon: ScanSearch
  },
  {
    title: "Freighter Connect",
    description: "Try a browser wallet connection example.",
    character: "A friendly wallet mascot waves when Freighter is nearby.",
    href: "/tools/freighter-connect",
    status: "MVP",
    category: "network",
    icon: WalletCards
  },
  {
    title: "Testnet Faucet Helper",
    description: "Fund a testnet account with Friendbot.",
    character: "A faucet character pours harmless testnet XLM.",
    href: "/tools/testnet-faucet",
    status: "Working",
    category: "network",
    icon: Droplets
  },
  {
    title: "Asset Metadata Inspector",
    description: "Fetch and browse stellar.toml currency metadata for any issuer domain.",
    character: "A star librarian leafs through issuer TOML scrolls.",
    href: "/tools/asset-metadata",
    status: "Working",
    category: "validation",
    icon: FileSearch
  },
  {
    title: "Federation Resolver",
    description: "Resolve Stellar federation addresses (name*domain) into public keys and memos.",
    character: "A diligent wallet-style postmaster routes names to verified destinations.",
    href: "/tools/federation-resolver",
    status: "Working",
    category: "validation",
    icon: AtSign
  },
  {
    title: "Network Fee Statistics",
    description: "Check Horizon fee-market stats in stroops and XLM.",
    character: "A gauge gremlin reads the fee market on demand.",
    href: "/tools/fee-stats",
    status: "MVP",
    category: "network",
    icon: Gauge
  }
];

/**
 * Retrieves a tool by its href route.
 * Returns undefined if no tool with the given href exists.
 */
export function getToolByHref(href: string): Tool | undefined {
  return tools.find((tool) => tool.href === href);
}

/**
 * Returns all routes defined in the registry.
 * Useful for route validation and navigation purposes.
 */
export function getAllToolRoutes(): string[] {
  return tools.map((tool) => tool.href);
}

/**
 * Validates that all tool routes are unique.
 * Returns an array of duplicate routes if any exist.
 */
export function getDuplicateRoutes(): string[] {
  const routeCounts = tools.reduce(
    (acc, tool) => {
      acc[tool.href] = (acc[tool.href] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(routeCounts)
    .filter(([, count]) => count > 1)
    .map(([route]) => route);
}
