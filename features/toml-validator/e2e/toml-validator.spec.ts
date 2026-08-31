/**
 * End-to-end specification for the stellar.toml Validator tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/toml-validator",
  steps: [
    { action: "visit", target: "/tools/toml-validator" },
    { action: "expect", target: "heading", value: "stellar.toml Validator" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
