import type { AssetFlagsInspectorErrorCode } from "@/features/asset-flags-inspector/types";

export const copy = {
  formLabel: "Account address",
  formHint: "Paste a Stellar account address starting with G. Flags are public data.",
  submit: "Inspect flags",
  loading: "Loading flags...",
  emptyTitle: "No account loaded yet",
  emptyDescription: "Paste an account address to see its authorization flags.",
  resultTitle: "Authorization Flags",
  noFlagsTitle: "No flags set",
  noFlagsDescription: "This is an ordinary account issuing nothing special.",
  disclaimer: "Note: These flags apply to assets issued by this account, not to assets it holds.",
  
  flagAuthRequiredName: "Authorization Required",
  flagAuthRequiredDesc: "Holders must be explicitly authorized by the issuer before they can hold the asset.",
  flagAuthRevocableName: "Authorization Revocable",
  flagAuthRevocableDesc: "The issuer can revoke holder authorization at any time, freezing the asset.",
  flagAuthImmutableName: "Authorization Immutable",
  flagAuthImmutableDesc: "These flag settings are permanent and cannot be changed by the issuer.",
  flagAuthClawbackEnabledName: "Clawback Enabled",
  flagAuthClawbackEnabledDesc: "The issuer can claw back (burn) the asset from holder accounts.",

  fullIssuerControl: "Full issuer control: The issuer has both Authorization Required and Revocable enabled.",
} as const;

export const errorCopy: Record<
  AssetFlagsInspectorErrorCode,
  { title: string; description: string }
> = {
  empty_input: {
    title: "Enter an account address",
    description: "Paste a Stellar address starting with G to load its flags.",
  },
  invalid_address: {
    title: "That is not a valid account address",
    description: "The value failed Stellar's checksum check. Confirm it starts with G and was copied in full.",
  },
  account_not_found: {
    title: "This account does not exist",
    description: "The account has not been funded on the network.",
  },
  rate_limited: {
    title: "Horizon is rate limiting this request",
    description: "Too many requests were made in a short window. Wait a moment and try again.",
  },
  request_failed: {
    title: "Could not reach Horizon",
    description: "The request did not complete. Check your connection and try again.",
  },
};
