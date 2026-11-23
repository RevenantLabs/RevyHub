import type { AuditErrorCode } from "./types";
export const copy = {
  bundleLabel: "Authorization entries XDR", bundleHint: "Paste one base64 SorobanAuthorizationEntry per line. No keys or envelopes.",
  networkLabel: "Network passphrase", networkHint: "The network is supplied explicitly; it is not inferred from XDR.",
  ledgerLabel: "Evaluation ledger", ledgerHint: "Optional decimal ledger sequence. Leave blank to show unknown expiry.",
  customNetworkLabel: "Custom network passphrase", chooseNetwork: "Choose a network", testnet: "Testnet", public: "Public", futurenet: "Futurenet", custom: "Custom",
  submit: "Audit entries", working: "Auditing locally…", reset: "Clear result",
  emptyTitle: "Nothing audited yet", emptyDescription: "Paste authorization entries and a network passphrase to inspect nonce reuse and expiry.",
  resultTitle: "Authorization audit", rowsTitle: "Credential entries", reuseTitle: "Repeated address nonces", expiryTitle: "Expiry at evaluation ledger",
  noReuse: "No repeated address nonces in this pasted bundle.", incompleteTitle: "Incomplete evidence",
  incompleteDescription: "A missing evaluation ledger or source-account credential leaves some outcomes unknown.",
  limitation: "Signature payload presence is visible, but signature validity and on-chain nonce availability are unknown. This offline audit never verifies either.",
  sourceNote: "Evidence: user-pasted XDR only. Network and evaluation ledger are user supplied.",
  sourceAccount: "Source-account credentials carry no address, nonce, signature or expiration ledger in the entry; envelope context is required.",
  sourceIdentity: "Source account (identity requires envelope context)", sourceNonceUnavailable: "Unavailable in source-account credential", ledgerNotSupplied: "Not supplied",
  credentialLabels: { "source-account": "Source-account credential", address: "Address credential" },
  index: "Entry", identity: "Credential identity", nonce: "Nonce", expiration: "Expiration ledger", status: "Expiry status", payload: "Signature payload", present: "Present", absent: "Absent", unavailable: "Unavailable", ready: "Not expired at supplied ledger", expired: "Expired at supplied ledger", unknown: "Unknown", entries: "Entries", network: "Network passphrase", ledger: "Evaluation ledger"
} as const;
export const errorCopy: Record<AuditErrorCode, {title: string; description: string}> = {
  invalid_input: { title: "Check the input", description: "Provide base64 XDR entries, one per line, and a network passphrase. Ledger must be a uint32 decimal value. Do not paste secret keys." },
  malformed_data: { title: "XDR could not be decoded", description: "Check that every line is a complete SorobanAuthorizationEntry XDR value." },
  unsupported_variant: { title: "Unsupported credential variant", description: "This SDK supports source-account and address credentials only. Use a supported XDR variant." },
  too_large: { title: "Input exceeds the local limit", description: "Use at most 50 entries, 16,384 characters per entry and 131,072 characters total." }
};
