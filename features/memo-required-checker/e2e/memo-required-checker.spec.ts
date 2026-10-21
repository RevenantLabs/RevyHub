export const spec = {
  route: "/tools/memo-required-checker",
  steps: [
    { action: "visit", target: "/tools/memo-required-checker" },
    { action: "expect", target: "heading", value: "SEP-29 Memo Required Checker" },
    { action: "click", target: "Check memo requirement" },
    { action: "expect", target: "alert", value: "Enter a valid destination account" }
  ]
} as const;
