export const spec = {
  route: "/tools/sep24-transaction-status-tracker",
  steps: [
    { action: "visit", target: "/tools/sep24-transaction-status-tracker" },
    { action: "expect", target: "heading", value: "SEP-24 Transaction Status Tracker" },
    { action: "expect", target: "alert", value: "The SEP-10 token was rejected" }
  ]
} as const;
