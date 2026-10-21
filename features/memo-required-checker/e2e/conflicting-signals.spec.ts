export const spec = {
  route: "/tools/memo-required-checker",
  steps: [
    { action: "visit", target: "/tools/memo-required-checker" },
    { action: "expect", target: "heading", value: "SEP-29 Memo Required Checker" },
    { action: "expect", target: "text", value: "The data entry and stellar.toml disagree" }
  ]
} as const;
