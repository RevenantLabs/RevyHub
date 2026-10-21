import type { Sep24TransactionStatusTrackerErrorCode } from "@/features/sep24-transaction-status-tracker/types";

export const copy = {
  domainLabel: "Anchor home domain",
  domainHint: "The domain that publishes stellar.toml, without https://.",
  transactionLabel: "Transaction id",
  transactionHint: "The id returned when the deposit or withdrawal started.",
  tokenLabel: "SEP-10 token",
  tokenHint: "A bearer JWT for this anchor. It stays in memory for this check and is not shown again.",
  submit: "Check status",
  loading: "Asking the anchor...",
  emptyTitle: "No transaction checked yet",
  emptyDescription: "Enter an anchor domain, a SEP-24 transaction id, and a SEP-10 token.",
  resultTitle: "SEP-24 status",
  jwtWarningTitle: "This token is a bearer credential",
  jwtWarning:
    "The SEP-10 JWT authorizes this anchor session. It is sent once as an Authorization header, kept only in memory, and never written into the result.",
  transferServerLabel: "Transfer server",
  kindLabel: "Kind",
  amountInLabel: "Amount in",
  amountOutLabel: "Amount out",
  amountFeeLabel: "Fee",
  notProvided: "Not provided",
  unknownStatus: "Undocumented status",
  unknownNext: "The anchor returned a status this tool does not document. Open the anchor's own instructions before doing anything else."
} as const;

export const statusCopy: Record<string, { explanation: string; nextStep: string }> = {
  incomplete: {
    explanation: "The anchor does not have everything it needs yet.",
    nextStep: "Finish the anchor's form, then check this transaction again."
  },
  pending_user_transfer_start: {
    explanation: "The anchor is waiting for you to send the Stellar payment.",
    nextStep: "Send the payment described by the anchor, using the memo they gave you."
  },
  pending_user_transfer_complete: {
    explanation: "The anchor is waiting for your payment to arrive.",
    nextStep: "Wait for the payment to settle, then check again."
  },
  pending_external: {
    explanation: "The anchor is waiting on an off-chain transfer.",
    nextStep: "Complete the bank or external transfer if you have not, then check again."
  },
  pending_anchor: {
    explanation: "The anchor is processing the transaction.",
    nextStep: "Wait, then check again. No payment is required from you right now."
  },
  pending_stellar: {
    explanation: "The anchor is submitting the Stellar payment.",
    nextStep: "Wait for that payment to appear, then check again."
  },
  pending_trust: {
    explanation: "Your account is missing a trustline for this asset.",
    nextStep: "Add the trustline, then check again."
  },
  pending_user: {
    explanation: "The anchor needs another action from you.",
    nextStep: "Open the anchor's instructions and complete the requested step."
  },
  on_hold: {
    explanation: "The anchor paused this transaction.",
    nextStep: "Check the anchor for what they need before sending anything else."
  },
  completed: {
    explanation: "The transaction is finished.",
    nextStep: "No further action is required."
  },
  refunded: {
    explanation: "The anchor refunded this transaction.",
    nextStep: "Confirm the refund with the anchor if the funds are not where you expect."
  },
  expired: {
    explanation: "The transaction expired.",
    nextStep: "Start a new deposit or withdrawal if you still want to move the funds."
  },
  error: {
    explanation: "The anchor reported an error.",
    nextStep: "Read the anchor's message before trying again."
  },
  no_market: {
    explanation: "The anchor could not convert this amount.",
    nextStep: "Try a different amount or asset."
  },
  too_small: {
    explanation: "The amount is below the anchor's minimum.",
    nextStep: "Increase the amount and start a new transaction."
  },
  too_large: {
    explanation: "The amount is above the anchor's maximum.",
    nextStep: "Decrease the amount and start a new transaction."
  }
};

export const errorCopy: Record<
  Sep24TransactionStatusTrackerErrorCode,
  { title: string; description: string }
> = {
  invalid_home_domain: {
    title: "Enter a valid anchor domain",
    description: "Use a hostname such as anchor.example. Do not include a scheme or path."
  },
  missing_transfer_server: {
    title: "This anchor does not publish SEP-24",
    description: "stellar.toml has no TRANSFER_SERVER_SEP0024 field, so there is no transfer server to ask."
  },
  invalid_transaction_id: {
    title: "Enter a valid transaction id",
    description: "Use the id the anchor returned. It can contain letters, digits, _ and -."
  },
  unauthorized: {
    title: "The SEP-10 token was rejected",
    description: "The token is missing, expired, or the anchor refused it. This is not a missing transaction. Paste a fresh token."
  },
  transaction_not_found: {
    title: "That transaction was not found",
    description: "The anchor accepted the token and reported no transaction with this id."
  },
  request_failed: {
    title: "The anchor could not be reached",
    description: "The stellar.toml or transaction request failed. Check the domain and try again."
  }
};
