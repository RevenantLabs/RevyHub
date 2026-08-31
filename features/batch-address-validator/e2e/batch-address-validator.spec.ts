/**
 * End-to-end specification for the Bulk Address Validator tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/batch-address-validator",
  steps: [
    { action: "visit", target: "/tools/batch-address-validator" },
    { action: "expect", target: "heading", value: "Bulk Address Validator" },
    { action: "paste", target: "textarea", value: "GABC... (valid key from fixture)" },
    { action: "click", target: "submit" },
    { action: "expect", target: "text", value: "Validation results" },
    { action: "click", target: "submit", note: "empty textarea" },
    { action: "expect", target: "alert" }
  ]
} as const;
