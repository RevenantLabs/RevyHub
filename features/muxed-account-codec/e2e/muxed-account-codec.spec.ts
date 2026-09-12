/**
 * End-to-end specification for the Muxed Account Encoder and Decoder.
 *
 * Written as declarative steps so the intended browser behaviour is reviewable
 * and diffable before a browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/muxed-account-codec",
  steps: [
    { action: "visit", target: "/tools/muxed-account-codec" },
    { action: "expect", target: "heading", value: "Muxed Account Encoder and Decoder" },
    {
      action: "fill",
      target: "Multiplexed address (M-address)",
      value: "<valid M address>"
    },
    { action: "click", target: "Decode address" },
    {
      action: "expect",
      target: "status",
      value: "Successfully decoded M-address into base account and multiplexing ID."
    },
    {
      action: "expect",
      target: "explanation",
      value: "same ledger account with different routing"
    },
    { action: "click", target: "Encode G-Address + ID" },
    {
      action: "fill",
      target: "Base account address (G-address)",
      value: "<valid G address>"
    },
    {
      action: "fill",
      target: "Multiplexing ID (uint64)",
      value: "18446744073709551615"
    },
    { action: "click", target: "Encode address" },
    {
      action: "expect",
      target: "status",
      value: "Successfully encoded base account and multiplexing ID into M-address."
    },
    {
      action: "fill",
      target: "Base account address (G-address)",
      value: "<secret S seed>"
    },
    { action: "click", target: "Encode address" },
    { action: "expect", target: "alert", value: "Invalid base account address" },
    { action: "expectAbsent", target: "page", value: "<secret S seed>" }
  ]
} as const;
