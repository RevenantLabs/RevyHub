import type { ErrorCode } from "./types";

export const copy = {
  title: "SEP-0007 Request Policy Auditor",
  description: "Compare a pasted payment-request URI with a local allowlist. Callback URLs stay text and are never opened.",
  submit: "Audit request",
  loading: "Checking the local policy…",
  reset: "Reset",
  emptyTitle: "Paste a request and a policy",
  emptyDescription: "The URI is parsed in the browser. A passing parse is not the same as accepting the payment.",
  resultTitle: "Policy verdict",
  fieldsTitle: "Request fields",
  rulesTitle: "Active rules",
  verdictsTitle: "Rule outcomes",
  rejected: "Secret keys are discarded and never copied into the verdict.",
  fields: {
    uri: {
      label: "SEP-0007 URI",
      hint: "A web+stellar:pay request. Signature parameters are ignored and not verified.",
      multiline: true
    },
    policy: {
      label: "Local policy JSON",
      hint: "Destinations, stroop range, passphrases, callback hosts, assets and memos. This file never leaves the browser.",
      multiline: true
    }
  }
} as const;

export const errorCopy: Record<ErrorCode, { title: string; description: string }> = {
  invalid_uri: {
    title: "URI could not be read",
    description: "Paste a web+stellar:pay URI with a valid G… destination. Amounts use at most 7 decimal places."
  },
  unsupported_operation: {
    title: "Operation is not a payment request",
    description: "This auditor only reads pay operations. Replace a tx request with a pay request."
  },
  invalid_policy: {
    title: "Policy JSON is not usable",
    description: "Provide destinations, a min and max amount, passphrases and callback hosts as JSON."
  },
  destination_denied: {
    title: "Destination is not allowed",
    description: "Add the destination to the local allowlist or refuse the request."
  },
  amount_out_of_range: {
    title: "Amount is outside the policy range",
    description: "Change the amount so its stroop value sits between the policy minimum and maximum."
  },
  network_denied: {
    title: "Network passphrase is not allowed",
    description: "The request names a passphrase this policy does not list. Refuse it or update the allowlist."
  }
};
