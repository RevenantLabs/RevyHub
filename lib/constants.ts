import {
  BadgeCheck,
  CircleDollarSign,
  Droplets,
  Landmark,
  QrCode,
  Scan,
  Search,
  ShieldCheck,
  WalletCards
} from "lucide-react";

export type ToolStatus = "Working" | "MVP" | "Coming Soon";

export const tools = [
  {
    title: "Address Validator",
    description: "Validate Stellar public keys and explain address format issues.",
    character: "A careful star clerk checks every public key badge.",
    href: "/tools/address-validator",
    status: "Working" as ToolStatus,
    icon: ShieldCheck
  },
  {
    title: "Balance Viewer",
    description: "Inspect testnet account balances through Horizon.",
    character: "A moon wallet opens its pockets for testnet balances.",
    href: "/tools/balance-viewer",
    status: "Working" as ToolStatus,
    icon: CircleDollarSign
  },
  {
    title: "Trustline Checker",
    description: "Check whether an account trusts a specific issued asset.",
    character: "A tiny inspector looks for asset handshakes.",
    href: "/tools/trustline-checker",
    status: "MVP" as ToolStatus,
    icon: BadgeCheck
  },
  {
    title: "Payment QR Generator",
    description: "Create demo Stellar payment request QR codes.",
    character: "A rocket assistant frames payment details as a QR poster.",
    href: "/tools/payment-qr",
    status: "Working" as ToolStatus,
    icon: QrCode
  },
  {
    title: "Transaction Lookup",
    description: "Look up testnet transactions by hash.",
    character: "A detective comet follows transaction trails through Horizon.",
    href: "/tools/transaction-lookup",
    status: "MVP" as ToolStatus,
    icon: Search
  },
  {
    title: "Freighter Connect",
    description: "Try a browser wallet connection example.",
    character: "A friendly wallet mascot waves when Freighter is nearby.",
    href: "/tools/freighter-connect",
    status: "MVP" as ToolStatus,
    icon: WalletCards
  },
  {
    title: "Testnet Faucet Helper",
    description: "Fund a testnet account with Friendbot.",
    character: "A faucet character pours harmless testnet XLM.",
    href: "/tools/testnet-faucet",
    status: "Working" as ToolStatus,
    icon: Droplets
  },
  {
    title: "Contract Inspector",
    description: "Validate Soroban contract IDs and generate explorer links.",
    character: "A curious inspector decodes contract ID badges and checks their StrKey credentials.",
    href: "/tools/contract-inspector",
    status: "MVP" as ToolStatus,
    icon: Scan
  }
];

export const projectLinks = [
  {
    title: "GrantFox-ready MVP",
    description: "Built for a focused open-source Stellar project application.",
    icon: Landmark
  }
];
