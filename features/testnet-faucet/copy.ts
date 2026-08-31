import type { FaucetErrorCode } from "@/features/testnet-faucet/types";

export const copy = {
  formLabel: "Testnet account address",
  formHint:
    "Paste the public address to fund. Never paste a secret key — funding only needs the public address.",
  submit: "Fund this account",
  loading: "Asking Friendbot...",
  emptyTitle: "No account funded yet",
  emptyDescription:
    "Friendbot creates and funds accounts on Stellar testnet only. Nothing here touches mainnet or real value.",
  successTitle: "Account funded on testnet",
  resultTitle: "Funding result",
  viewOnExplorer: "View on stellar.expert",
  mainnetWarning:
    "Friendbot is testnet-only. Switching the network in the header does not change what this tool does."
} as const;

export const errorCopy: Record<FaucetErrorCode, { title: string; description: string }> = {
  empty_input: {
    title: "Enter an account address",
    description: "Paste the public address you want Friendbot to fund."
  },
  invalid_address: {
    title: "That is not a valid account address",
    description:
      "It must be a Stellar public address starting with G. If your value starts with S it is a secret key and must never be pasted anywhere."
  },
  already_funded: {
    title: "This account already exists on testnet",
    description:
      "Friendbot only creates accounts that do not exist yet. Check the balance in the Balance Viewer instead."
  },
  rate_limited: {
    title: "Friendbot is rate limiting requests",
    description: "Friendbot limits how often it funds accounts. Wait a minute and try again."
  },
  friendbot_unavailable: {
    title: "Friendbot is not responding",
    description:
      "The testnet faucet is a public service and is occasionally down or resetting. Try again shortly."
  },
  request_failed: {
    title: "The funding request did not complete",
    description: "Friendbot refused the request. Check the address and try again."
  }
};
