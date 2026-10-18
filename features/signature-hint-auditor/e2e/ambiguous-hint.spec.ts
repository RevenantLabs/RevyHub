export const spec = {
  route: "/tools/signature-hint-auditor",
  steps: [
    { action: "visit", target: "/tools/signature-hint-auditor" },
    { action: "expect", target: "heading", value: "Transaction Signature Hint Auditor" },

    // Ambiguous hint: two public keys recorded against the same four bytes.
    {
      action: "fill",
      target: "Transaction envelope XDR",
      value: "<base64 envelope whose hint collides across two candidate keys>"
    },
    {
      action: "fill",
      target: "Optional public signer keys",
      value: "<real G…>\n<impostor G… sharing the same four-byte hint>"
    },
    { action: "click", target: "Audit signature hints" },
    { action: "expect", target: "text", value: "Signature hint audit" },
    { action: "expect", target: "text", value: "Ambiguous and missing hints" },
    {
      action: "expect",
      target: "text",
      value: "Ambiguous hint — multiple public keys share these four bytes"
    },
    {
      action: "expect",
      target: "text",
      value: "Every match below is a hint match, not cryptographic verification"
    },

    // Unmatched hint when none of the pasted keys claim the signature.
    {
      action: "fill",
      target: "Optional public signer keys",
      value: "<unrelated G… public key>"
    },
    { action: "click", target: "Audit signature hints" },
    {
      action: "expect",
      target: "text",
      value: "No candidate among the keys you provided"
    },

    // Secret seed in the signer field is refused.
    {
      action: "fill",
      target: "Optional public signer keys",
      value: "<ed25519 secret seed>"
    },
    { action: "click", target: "Audit signature hints" },
    {
      action: "expect",
      target: "alert",
      value: "One of the signer keys is not a public key"
    },
    { action: "expectNotVisible", target: "text", value: "<ed25519 secret seed>" },

    { action: "expectNoRequest", target: "network" }
  ]
} as const;
