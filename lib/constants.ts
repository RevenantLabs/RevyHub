import {
  BadgeCheck,
  CircleDollarSign,
  Droplets,
  Landmark,
  QrCode,
  Search,
  ShieldCheck,
  WalletCards
} from "lucide-react";

export type ToolStatus = "Working" | "MVP" | "Coming Soon";

export const tools = [
  {
    title: "Address Validator",
    description: "Validate Stellar public keys and catch address format issues before testnet workflows begin.",
    character: "A careful star clerk checks every public key badge.",
    href: "/tools/address-validator",
    status: "Working" as ToolStatus,
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
    icon: BadgeCheck
  },
  {
    title: "Payment QR Generator",
    description: "Create demo Stellar payment request URIs and QR codes for destinations, amounts, assets, and memos.",
    character: "A rocket assistant frames payment details as a QR poster.",
    href: "/tools/payment-qr",
    status: "Working" as ToolStatus,
    icon: QrCode
  },
  {
    title: "Transaction Lookup",
    description: "Look up Stellar testnet transaction hashes and review key Horizon details.",
    character: "A detective comet follows transaction trails through Horizon.",
    href: "/tools/transaction-lookup",
    status: "MVP" as ToolStatus,
    icon: Search
  },
  {
    title: "Freighter Connect",
    description: "Test a browser Freighter wallet connection and compare the wallet network with the active workspace.",
    character: "A friendly wallet mascot waves when Freighter is nearby.",
    href: "/tools/freighter-connect",
    status: "MVP" as ToolStatus,
    icon: WalletCards
  },
  {
    title: "Testnet Faucet Helper",
    description: "Fund a public Stellar testnet account with Friendbot without handling secret keys or seed phrases.",
    character: "A faucet character pours harmless testnet XLM.",
    href: "/tools/testnet-faucet",
    status: "Working" as ToolStatus,
    icon: Droplets
  }
];

export const projectLinks = [
  {
    title: "GrantFox-ready MVP",
    description: "Built for a focused open-source Stellar project application.",
    icon: Landmark
  }
];
