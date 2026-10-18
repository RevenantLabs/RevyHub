/**
 * End-to-end specification for the Ed25519 Signature Verifier tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/signature-verifier",
  steps: [
    { action: "visit", target: "/tools/signature-verifier" },
    { action: "expect", target: "heading", value: "Ed25519 Signature Verifier" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
