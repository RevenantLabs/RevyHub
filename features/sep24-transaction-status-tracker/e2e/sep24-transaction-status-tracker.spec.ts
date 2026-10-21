export const spec = {
  route: "/tools/sep24-transaction-status-tracker",
  steps: [
    { action: "visit", target: "/tools/sep24-transaction-status-tracker" },
    { action: "expect", target: "heading", value: "SEP-24 Transaction Status Tracker" },
    { action: "click", target: "Check status" },
    { action: "expect", target: "alert", value: "Enter a valid anchor domain" }
  ]
} as const;
