/**
 * End-to-end specification for the Address Validator.
 *
 * Written as declarative steps so the intended browser behaviour is reviewable
 * and diffable before a browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/address-validator",
  steps: [
    { action: "visit", target: "/tools/address-validator" },
    { action: "expect", target: "heading", value: "Address Validator" },
    { action: "fill", target: "Stellar address", value: "<valid G address>" },
    { action: "click", target: "Validate address" },
    { action: "expect", target: "status", value: "This is a valid Stellar public address" },
    { action: "fill", target: "Stellar address", value: "<secret S seed>" },
    { action: "click", target: "Validate address" },
    { action: "expect", target: "alert", value: "That looks like a secret key" },
    { action: "expectAbsent", target: "page", value: "<secret S seed>" }
  ]
} as const;
