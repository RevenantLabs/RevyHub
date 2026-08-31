/**
 * End-to-end specification for the Stroop and Amount Converter tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/amount-converter",
  steps: [
    { action: "visit", target: "/tools/amount-converter" },
    { action: "expect", target: "heading", value: "Stroop and Amount Converter" },
    { action: "type", target: "stroops", value: "10000000" },
    { action: "expect", target: "amount", value: "1.0000000" },
    { action: "click", target: "max-example" },
    { action: "expect", target: "stroops", value: "9223372036854775807" }
  ]
} as const;
