export const spec = {
  route: "/tools/signature-hint-auditor",
  steps: [
    { action: "visit", target: "/tools/signature-hint-auditor" },
    { action: "expect", target: "heading", value: "Transaction Signature Hint Auditor" },
    { action: "expect", target: "text", value: "No envelope audited yet" },

    // Classic envelope with an optional public key — hint match, not verification.
    {
      action: "fill",
      target: "Transaction envelope XDR",
      value: "<base64 classic envelope with one signature>"
    },
    {
      action: "fill",
      target: "Optional public signer keys",
      value: "<matching G… public key>"
    },
    { action: "click", target: "Audit signature hints" },
    { action: "expect", target: "text", value: "Signature hint audit" },
    { action: "expect", target: "text", value: "Transaction signatures" },
    { action: "expect", target: "text", value: "Hint match" },
    {
      action: "expect",
      target: "text",
      value: "Every match below is a hint match, not cryptographic verification"
    },
    {
      action: "expect",
      target: "text",
      value: "Input stays in memory for this session only"
    },

    // Fee-bump: outer and inner groups stay separate.
    {
      action: "fill",
      target: "Transaction envelope XDR",
      value: "<base64 fee-bump envelope>"
    },
    {
      action: "fill",
      target: "Optional public signer keys",
      value: "<fee source G…>\n<source G…>"
    },
    { action: "click", target: "Audit signature hints" },
    { action: "expect", target: "text", value: "Fee-bump outer signatures" },
    { action: "expect", target: "text", value: "Fee-bump inner signatures" },

    // Empty envelope.
    { action: "fill", target: "Transaction envelope XDR", value: "" },
    { action: "click", target: "Audit signature hints" },
    { action: "expect", target: "alert", value: "Paste an envelope first" },

    // Secret seed refused and never echoed.
    {
      action: "fill",
      target: "Transaction envelope XDR",
      value: "<ed25519 secret seed>"
    },
    { action: "click", target: "Audit signature hints" },
    {
      action: "expect",
      target: "alert",
      value: "That is not a usable transaction envelope"
    },
    { action: "expectNotVisible", target: "text", value: "<ed25519 secret seed>" },

    { action: "expectNoRequest", target: "network" }
  ]
} as const;
