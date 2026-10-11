import type { SorobanAuthInspectorErrorCode } from "@/features/soroban-auth-inspector/types";

export const copy = {
  formLabel: "Transaction envelope XDR",
  formHint:
    "Paste a base64-encoded Soroban transaction envelope to inspect the authorization entries and their nested invocation tree.",
  submit: "Inspect authorization",
  loading: "Inspecting authorization entries...",
  emptyTitle: "No authorization inspected yet",
  emptyDescription:
    "Paste a Soroban transaction envelope to see who must sign, for which contract calls, and which sub-calls are bundled under the same signature.",
  resultTitle: "Authorization entries",
  noAuthorizationTitle: "No authorization required",
  noAuthorizationDescription:
    "This invocation declares no authorization entries. It either uses source-account authorization only or is a read-only call.",
  entryTitle: "Entry",
  credentialsTitle: "Credentials",
  sourceAccountCredentials: "Source account",
  addressCredentials: "Address credentials",
  nonceLabel: "Nonce",
  signatureExpirationLedgerLabel: "Signature expires at ledger",
  accountLabel: "Account",
  contractLabel: "Contract",
  unknownSigner: "Unknown signer",
  invocationTreeTitle: "Invocation tree",
  functionLabel: "Function",
  argsLabel: "Arguments",
  noArgs: "No arguments",
  subInvocationsLabel: "Sub-invocations",
  noSubInvocations: "No sub-invocations",
  suspiciousSubInvocation: "⚠ This sub-invocation is not implied by the top-level call",
  xdrPlaceholder: "AAAA..."
} as const;

export const errorCopy: Record<
  SorobanAuthInspectorErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Enter a transaction envelope",
    description: "Paste a base64-encoded Soroban transaction envelope to inspect its authorization entries."
  },
  invalid_base64: {
    title: "That is not valid base64",
    description: "The input could not be decoded as base64. Check for missing or extra characters."
  },
  invalid_xdr: {
    title: "That is not a valid transaction envelope",
    description:
      "The input is valid base64, but it is not a Stellar transaction envelope. Check that it is complete."
  },
  not_soroban: {
    title: "No Soroban invocation found",
    description:
      "The envelope does not contain an Invoke Host Function operation. This tool only inspects Soroban invocations."
  },
  no_authorization: {
    title: "No authorization entries",
    description:
      "The invocation declares no authorization entries. It may use source-account authorization or be read-only."
  },
  auth_unreadable: {
    title: "Authorization entry could not be decoded",
    description:
      "An authorization entry is present but could not be parsed. The envelope may use an unsupported XDR shape."
  }
};
