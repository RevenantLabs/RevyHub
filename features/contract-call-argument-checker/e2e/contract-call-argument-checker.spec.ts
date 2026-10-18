export const spec = {
  route: "/tools/contract-call-argument-checker",
  steps: [
    { action: "visit", target: "/tools/contract-call-argument-checker" },
    { action: "fill", target: "spec, function name and one u32 argument", value: "transfer fixture" },
    { action: "click", target: "Check arguments" },
    { action: "expect", target: "a match with no type mismatches" },
    { action: "click", target: "Reset" },
    { action: "expect", target: "idle state and cleared text areas" }
  ]
} as const;
