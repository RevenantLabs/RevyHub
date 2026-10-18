import type { Sep10InspectorErrorCode } from "@/features/sep10-inspector/types";

export const copy = {
  formLabel: "Signed challenge transaction XDR",
  formHint: "Paste the base64 SEP-10 challenge envelope. This inspector stays offline.",
  submit: "Inspect challenge",
  emptyTitle: "No challenge inspected",
  emptyDescription: "Paste a SEP-10 transaction envelope to inspect its structure, bounds and ManageData values.",
  resultTitle: "SEP-10 challenge structure"
} as const;

export const errorCopy: Record<Sep10InspectorErrorCode, { title: string; description: string }> = {
  empty_input: { title: "Paste a challenge envelope", description: "Provide the base64 XDR returned by the anchor authentication flow." },
  invalid_xdr: { title: "That is not a transaction envelope", description: "Use the base64 XDR envelope, not a secret seed or an address." },
  not_a_challenge: { title: "This is not a SEP-10 challenge", description: "The envelope must contain home_domain and web_auth_domain ManageData operations." },
  expired_challenge: { title: "The challenge has expired", description: "Request a fresh SEP-10 challenge before signing it." },
  malformed_challenge: { title: "The challenge is malformed", description: "Check its time bounds, sequence and server signing account." },
  request_failed: { title: "The challenge could not be inspected", description: "Check that the pasted XDR is complete and base64 encoded." }
};
