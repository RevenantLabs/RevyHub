export const spec = {
  route: "/tools/signer-rotation-impact-auditor",
  steps: [
    { action: "visit", target: "/tools/signer-rotation-impact-auditor" },
    { action: "expect", target: "heading", value: "Signer Rotation Impact Auditor" },
    { action: "expect", target: "text", value: "No rotation audited yet" },

    // Safe rotation.
    {
      action: "fill",
      target: "Horizon account JSON",
      value: "<Horizon account with master+cosigner weights 1/1, thresholds 1/2/2>"
    },
    {
      action: "fill",
      target: "Set-options envelope XDR",
      value: "<set_options raise cosigner weight then thresholds>"
    },
    { action: "select", target: "Network passphrase", value: "Testnet" },
    { action: "click", target: "Audit rotation impact" },
    { action: "expect", target: "status", value: "No lockout detected" },
    { action: "expect", target: "text", value: "Rotation timeline" },

    // Recovered intermediate lockout.
    {
      action: "fill",
      target: "Set-options envelope XDR",
      value: "<remove cosigner then lower high threshold>"
    },
    { action: "click", target: "Audit rotation impact" },
    {
      action: "expect",
      target: "status",
      value: "Final state recovers from an intermediate lockout"
    },

    // Incomplete evidence.
    {
      action: "fill",
      target: "Horizon account JSON",
      value: "<Horizon account JSON without signers array>"
    },
    { action: "click", target: "Audit rotation impact" },
    { action: "expect", target: "status", value: "Evidence is incomplete" },

    // Malformed envelope.
    {
      action: "fill",
      target: "Horizon account JSON",
      value: "<valid Horizon account JSON>"
    },
    { action: "fill", target: "Set-options envelope XDR", value: "not base64 at all" },
    { action: "click", target: "Audit rotation impact" },
    {
      action: "expect",
      target: "alert",
      value: "The account JSON or envelope could not be read"
    },

    { action: "expect", target: "button", value: "Copy JSON summary" },
    { action: "expectNoRequest", target: "network" }
  ]
} as const;
