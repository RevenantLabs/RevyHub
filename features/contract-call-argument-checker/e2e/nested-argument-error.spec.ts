export const spec = {
  route: "/tools/contract-call-argument-checker",
  steps: [
    { action: "visit", target: "/tools/contract-call-argument-checker" },
    { action: "fill", target: "set_owner spec and a map whose owner field is u32", value: "nested fixture" },
    { action: "click", target: "Check arguments" },
    { action: "expect", target: "argument 2 > field owner, expected address, actual u32" }
  ]
} as const;
