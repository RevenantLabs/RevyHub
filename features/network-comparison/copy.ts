import type { NetworkComparisonErrorCode } from "@/features/network-comparison/types";

export const copy = {
  submit: "Compare networks",
  refresh: "Refresh comparison",
  loading: "Querying Testnet and Mainnet endpoints...",
  networkSwitchNotice:
    "This tool queries both Testnet and Mainnet concurrently. Changing the network selector in the navigation header does not affect this comparison.",
  emptyTitle: "No comparison data loaded",
  emptyDescription:
    "Query both Testnet and Mainnet Horizon instances concurrently to compare protocol versions, base fees, base reserves, and ledger ingestion status side by side.",
  resultTitle: "Network comparison results",
  protocolDifferenceBadge: "Protocol difference",
  protocolSyncedBadge: "Protocols aligned",
  protocolDifferenceAlert: (testnet: number, mainnet: number) =>
    `Protocol difference detected: Testnet is running Protocol ${testnet} while Mainnet is running Protocol ${mainnet}. Transactions using new features may fail on Mainnet.`,
  protocolSyncedAlert: (protocol: number) =>
    `Both networks are currently aligned on Protocol ${protocol}.`,
  testnetResetTitle: "Testnet periodic reset",
  testnetResetDescription:
    "Testnet resets periodically to keep ledger history manageable. A reset wipes all accounts, balances, contracts, and state. Data present on Testnet before a reset does not exist on the new Testnet. Mainnet is never reset.",
  testnetColumnTitle: "Testnet",
  mainnetColumnTitle: "Mainnet",
  columnStatusOnline: "Online",
  columnStatusUnreachable: "Unreachable",
  observedAtLabel: "Observation time",
  ledgerSequenceLabel: "Latest ledger",
  closedAtLabel: "Ledger closed at",
  protocolVersionLabel: "Protocol version",
  coreSupportedVersionLabel: "Core supported protocol",
  baseFeeLabel: "Base fee",
  baseReserveLabel: "Base reserve",
  ingestionStateLabel: "Ingestion state",
  coreVersionLabel: "Stellar Core version",
  horizonVersionLabel: "Horizon version",
  networkPassphraseLabel: "Network passphrase",
  summaryTitle: "Comparison summary",
  protocolDifferenceSummary: "Protocol version difference",
  feeDifferenceSummary: "Base fee difference",
  reserveDifferenceSummary: "Base reserve difference",
  unavailable: "Unavailable",
  identical: "Identical",
  ingestionUpToDate: "Ingesting (up to date)",
  ingestionLagging: (ledgers: number) => `Lagging by ${ledgers.toLocaleString("en-US")} ledgers`,
  partialFailureNotice:
    "One network endpoint failed to respond. The active network is displayed below while the unavailable network reports its failure."
} as const;

export const errorCopy: Record<
  NetworkComparisonErrorCode,
  { title: string; description: string }
> = {
  both_unreachable: {
    title: "Both network endpoints unreachable",
    description:
      "Neither Testnet nor Mainnet Horizon endpoints responded. Verify your internet connection, check status.stellar.org for network outages, and try again."
  },
  partial_failure: {
    title: "Partial failure: one network unreachable",
    description:
      "One network endpoint failed to respond. Review the reported failure details in the corresponding column below and retry the comparison."
  },
  request_failed: {
    title: "Network comparison failed",
    description:
      "A transport error or timeout occurred while contacting network endpoints. Please retry the request."
  }
};
