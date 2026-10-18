/**
 * End-to-end specification for the Effects Timeline Viewer.
 *
 * Documented as executable steps so the behaviour is reviewable before a
 * browser runner is wired into CI, in the same shape as every other slice.
 */
export const spec = {
  route: "/tools/effects-timeline",
  steps: [
    { action: "visit", target: "/tools/effects-timeline" },
    { action: "expect", target: "heading", value: "Effects Timeline Viewer" },
    { action: "expect", target: "text", value: "No timeline loaded yet" },

    { action: "click", target: "Show effects timeline" },
    { action: "expect", target: "alert", value: "Enter an account address" },

    { action: "fill", target: "Account address", value: "GNOPE" },
    { action: "click", target: "Show effects timeline" },
    { action: "expect", target: "alert", value: "That is not a valid account address" },

    { action: "fill", target: "Account address", value: "<a funded G... address>" },
    { action: "click", target: "Show effects timeline" },
    { action: "expect", target: "status", value: "One operation, several effects" },
    { action: "expect", target: "list", value: "Transactions, newest first" },
    { action: "expect", target: "text", value: "Balance change" },
    { action: "expect", target: "text", value: "Configuration change" },

    { action: "expect", target: "button", value: "Newer effects", state: "disabled" },
    { action: "click", target: "Older effects" },
    { action: "expect", target: "text", value: "Page 2" },
    {
      action: "expect",
      target: "text",
      value: "Continued from the previous page — this transaction's later effects are shown there."
    },
    { action: "expect", target: "button", value: "Older effects", state: "disabled" },

    { action: "click", target: "Newer effects" },
    { action: "expect", target: "text", value: "Page 1" },

    { action: "switchNetwork", value: "mainnet" },
    { action: "expect", target: "text", value: "No timeline loaded yet" }
  ]
} as const;
