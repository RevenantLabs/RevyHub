/**
 * End-to-end specification for the Multisig Signature Weight Analyzer tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/multisig-analyzer",
  steps: [
    { action: "visit", target: "/tools/multisig-analyzer" },
    { action: "expect", target: "heading", value: "Multisig Signature Weight Analyzer" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
