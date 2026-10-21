import type { LedgerHeaderDecoderErrorCode, UpgradeSummary } from "@/features/ledger-header-decoder/types";

export const copy = {
  formLabel: "Ledger header XDR",
  formHint: "Paste a base64 LedgerHeader XDR blob. Decoding happens in this browser without a network request. Do not paste a secret key.",
  placeholder: "Paste base64 LedgerHeader XDR",
  submit: "Decode header",
  loading: "Decoding header…",
  emptyTitle: "No ledger header decoded yet",
  emptyDescription: "Paste a raw LedgerHeader XDR blob to inspect its header fields and embedded SCP value.",
  resultTitle: "Ledger header",
  scpTitle: "SCP value",
  upgradesTitle: "Proposed upgrades",
  upgradesDescription: "These are the upgrades carried in the SCP value; they are not proof that the network applied them.",
  noUpgrades: "No upgrades in this SCP value.",
  rawBytes: "Raw bytes (hex)",
  unrecognized: "Unrecognized upgrade type",
  protocolVersion: "Protocol version",
  ledgerSequence: "Ledger sequence",
  closeTime: "Close time",
  baseFee: "Base fee",
  baseReserve: "Base reserve",
  txSetHash: "Transaction set hash",
  stroopsUnit: "stroops",
  utcSecondsUnit: "UTC seconds",
  upgradeTypes: {
    protocol_version: "Protocol version",
    base_fee: "Base fee",
    max_tx_set_size: "Maximum transaction set size",
    base_reserve: "Base reserve",
    flags: "Flags",
    unrecognized: "Unrecognized upgrade type"
  } satisfies Record<UpgradeSummary["type"], string>
} as const;

export const errorCopy: Record<LedgerHeaderDecoderErrorCode, { title: string; description: string }> = {
  empty_xdr: { title: "Paste ledger header XDR first", description: "Copy the base64 LedgerHeader blob and paste it into the field above." },
  invalid_xdr: { title: "Invalid XDR encoding", description: "Paste complete base64 XDR using standard padding, rather than a URL, hex value or secret key." },
  malformed_header: { title: "Not a valid ledger header", description: "The bytes do not form one complete LedgerHeader with valid SCP fields. Check that you copied raw ledger header XDR." },
  too_large: { title: "XDR input is too large", description: "Paste one LedgerHeader blob smaller than 65,536 characters." }
};
