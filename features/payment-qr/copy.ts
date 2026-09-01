import type { PaymentQrErrorCode } from "@/features/payment-qr/types";

export const copy = {
  destinationLabel: "Destination address",
  destinationHint: "The account that should receive the payment.",
  amountLabel: "Amount",
  amountHint: "Up to 7 decimal places, the precision Stellar itself uses.",
  assetKindLabel: "Asset",
  assetNative: "XLM (native)",
  assetIssued: "Issued asset",
  assetCodeLabel: "Asset code",
  assetIssuerLabel: "Asset issuer",
  memoLabel: "Memo (optional)",
  memoHint: "A text memo, up to 28 bytes. Emoji and accented letters cost more than one byte.",
  memoCounter: (used: number) => `${used} / 28 bytes`,
  msgLabel: "Message to the payer (optional)",
  msgHint: "Shown by the wallet before the payer confirms. Up to 300 characters.",
  msgCounter: (used: number) => `${used} / 300 characters`,
  submit: "Generate QR code",
  generating: "Generating...",
  emptyTitle: "No payment request yet",
  emptyDescription:
    "Fill in a destination and amount to generate a SEP-0007 request. Nothing is sent anywhere — the QR is built in your browser.",
  resultTitle: "Payment request",
  uriLabel: "SEP-0007 URI",
  qrAlt: "QR code encoding the Stellar payment request",
  disclaimer:
    "This creates a payment request. It does not move any funds — the payer's wallet still has to approve and sign."
} as const;

export const errorCopy: Record<PaymentQrErrorCode, { title: string; description: string }> = {
  empty_destination: { title: "Enter a destination address", description: "The recipient is required." },
  invalid_destination: {
    title: "The destination is not a valid Stellar address",
    description: "It must start with G and pass the checksum check."
  },
  empty_amount: { title: "Enter an amount", description: "The amount to request is required." },
  invalid_amount: {
    title: "That amount is not valid",
    description: "Enter a positive number using digits and at most one decimal point."
  },
  amount_too_precise: {
    title: "Too many decimal places",
    description: "Stellar amounts carry at most 7 decimal places — one stroop is 0.0000001."
  },
  empty_asset_code: { title: "Enter an asset code", description: "For example USDC." },
  invalid_asset_code: {
    title: "That asset code is not valid",
    description: "Asset codes are 1 to 12 letters or numbers."
  },
  invalid_asset_issuer: {
    title: "The asset issuer is not valid",
    description: "An issued asset needs the issuing account address, starting with G."
  },
  memo_too_long: {
    title: "The memo is too long",
    description: "A Stellar text memo holds 28 bytes. Non-ASCII characters use more than one byte each."
  },
  message_too_long: {
    title: "The message is too long",
    description: "SEP-0007 limits the payer message to 300 characters."
  },
  qr_generation_failed: {
    title: "Could not render the QR code",
    description: "The request was valid but the QR image could not be produced. Try again."
  }
};
