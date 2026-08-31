/**
 * End-to-end specification for the SEP-0007 URI Signature Verifier tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/sep7-signature-verifier",
  steps: [
    { action: "visit", target: "/tools/sep7-signature-verifier" },
    { action: "expect", target: "heading", value: "SEP-0007 URI Signature Verifier" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
