import {
  AtSign,
  BadgeCheck,
  CircleDollarSign,
  Droplets,
  FileSearch,
  Gauge,
  Landmark,
  QrCode,
  ScanSearch,
  Search,
  ShieldCheck,
  WalletCards
} from "lucide-react";

export type ToolStatus = "Working" | "MVP" | "Coming Soon";

export type ToolCategory = "validation" | "balances" | "network";

export interface ToolCategoryInfo {
  label: string;
  description: string;
}

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

export interface Tool {
  title: string;
  description: string;
  character: string;
  href: string;
  status: ToolStatus;
  category: ToolCategory;
  icon: React.ComponentType<{ className?: string }>;
}

export const tools: Tool[] = [
  {
    title: "Address Validator",
    description: "Validate Stellar public keys and catch address format issues before testnet workflows begin.",
    character: "A careful star clerk checks every public key badge.",
    href: "/tools/address-validator",
    status: "Working" as ToolStatus,
    category: "validation",
    icon: ShieldCheck
  },
  {
    title: "Balance Viewer",
    description: "Inspect native XLM and issued asset balances for Stellar testnet accounts through Horizon.",
    character: "A moon wallet opens its pockets for testnet balances.",
    href: "/tools/balance-viewer",
    status: "Working" as ToolStatus,
    icon: CircleDollarSign
  },
  {
    title: "Trustline Checker",
    description: "Check whether a Stellar account has established a trustline for a specific issued asset.",
    character: "A tiny inspector looks for asset handshakes.",
    href: "/tools/trustline-checker",
    status: "MVP" as ToolStatus,
    category: "validation",
    icon: BadgeCheck
  },
  {
    title: "Balance Viewer",
    description: "Inspect account balances on the selected network through Horizon.",
    character: "A moon wallet opens its pockets for the selected network's balances.",
    href: "/tools/balance-viewer",
    status: "Working" as ToolStatus,
    category: "balances",
    icon: CircleDollarSign
  },
  {
    title: "Payment QR Generator",
    description: "Create demo Stellar payment request URIs and QR codes for destinations, amounts, assets, and memos.",
    character: "A rocket assistant frames payment details as a QR poster.",
    href: "/tools/payment-qr",
    status: "Working" as ToolStatus,
    category: "balances",
    icon: QrCode
  },
  {
    title: "Transaction Lookup",
    description: "Look up Stellar testnet transaction hashes and review key Horizon details.",
    character: "A detective comet follows transaction trails through Horizon.",
    href: "/tools/transaction-lookup",
    status: "MVP" as ToolStatus,
    category: "balances",
    icon: Search
  },
  {
    title: "XDR Inspector",
    description: "Decode transaction envelope XDR locally, without any network calls.",
    character: "A lens-eyed archivist unrolls transaction scrolls without leaving the library.",
    href: "/tools/xdr-inspector",
    status: "Working" as ToolStatus,
    category: "validation",
    icon: ScanSearch
  },
  {
    title: "Freighter Connect",
    description: "Test a browser Freighter wallet connection and compare the wallet network with the active workspace.",
    character: "A friendly wallet mascot waves when Freighter is nearby.",
    href: "/tools/freighter-connect",
    status: "MVP" as ToolStatus,
    category: "network",
    icon: WalletCards
  },
  {
    title: "Testnet Faucet Helper",
    description: "Fund a public Stellar testnet account with Friendbot without handling secret keys or seed phrases.",
    character: "A faucet character pours harmless testnet XLM.",
    href: "/tools/testnet-faucet",
    status: "Working" as ToolStatus,
    category: "network",
    icon: Droplets
  },
  {
    title: "Asset Metadata Inspector",
    description: "Fetch and browse stellar.toml currency metadata for any issuer domain.",
    character: "A star librarian leafs through issuer TOML scrolls.",
    href: "/tools/asset-metadata",
    status: "Working" as ToolStatus,
    category: "validation",
    icon: FileSearch
  },
  {
    title: "Federation Resolver",
    description: "Resolve Stellar federation addresses (name*domain) into public keys and memos.",
    character: "A diligent wallet-style postmaster routes names to verified destinations.",
    href: "/tools/federation-resolver",
    status: "Working" as ToolStatus,
    category: "validation",
    icon: AtSign
  },
  {
    title: "Network Fee Statistics",
    description: "Check Horizon fee-market stats in stroops and XLM.",
    character: "A gauge gremlin reads the fee market on demand.",
    href: "/tools/fee-stats",
    status: "MVP" as ToolStatus,
    category: "network",
    icon: Gauge
  }
];

export const projectLinks = [
  {
    title: "GrantFox-ready MVP",
    description: "Built for a focused open-source Stellar project application.",
    icon: Landmark
  }
];
