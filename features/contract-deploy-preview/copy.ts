import type { ErrorCode } from "./types";

export const copy = {
  title: "Contract Deploy Preview",
  description:
    "Paste a transaction envelope containing a CreateContract or CreateContractV2 host function to see its contract ID preimage source, executable and constructor arguments — decoded entirely in your browser.",
  fieldLabel: "Transaction envelope (base64 XDR)",
  fieldHint: "Paste the full envelope. Nothing is sent anywhere; decoding happens in your browser.",
  submit: "Preview deploy",
  reset: "Reset",
  emptyTitle: "Paste a transaction envelope",
  emptyDescription: "This tool is fully offline — it never makes a network request.",
  resultTitle: "Deploy preview",
  preimageTitle: "Contract ID preimage source",
  executableTitle: "Executable",
  constructorArgsTitle: "Constructor arguments",
  noConstructorArgs: "No constructor arguments (CreateContractV1 host function).",
  preimageAddressLabel: "Address + salt",
  preimageAssetLabel: "Asset",
  executableWasmLabel: "Wasm",
  executableStellarAssetLabel: "Built-in Stellar Asset Contract",
  preimageNote:
    "This is the salt- or asset-derived source of the contract ID, not the computed deployed address — see the implementation note below."
} as const;

export const errorCopy: Record<ErrorCode, { title: string; description: string }> = {
  empty_xdr: {
    title: "Paste a transaction envelope",
    description: "Enter the base64 XDR for a transaction envelope before previewing."
  },
  invalid_xdr: {
    title: "That is not a valid transaction envelope",
    description: "The pasted text is not valid base64 XDR for a Stellar transaction envelope."
  },
  no_create_contract_operation: {
    title: "No contract-creation host function found",
    description: "This envelope has an invokeHostFunction operation, but none of them creates a contract. Check the operation and try again."
  },
  unsupported_preimage: {
    title: "Unsupported contract ID preimage",
    description: "This envelope's contract ID preimage is not an address- or asset-derived preimage this tool recognizes."
  },
  too_large: {
    title: "Envelope is too large",
    description: "The pasted text is larger than this tool accepts. Paste only the envelope XDR."
  }
};
