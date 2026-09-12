/**
 * End-to-end specification for the StrKey Type Inspector tool.
 *
 * Written as declarative steps so the intended browser behaviour is reviewable
 * and diffable before a browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/strkey-inspector",
  steps: [
    { action: "visit", target: "/tools/strkey-inspector" },
    { action: "expect", target: "heading", value: "StrKey Type Inspector" },
    { action: "fill", target: "Stellar StrKey", value: "<valid G address>" },
    { action: "click", target: "Inspect StrKey" },
    { action: "expect", target: "status", value: "StrKey Inspection Result" },
    { action: "fill", target: "Stellar StrKey", value: "<secret S seed>" },
    { action: "click", target: "Inspect StrKey" },
    { action: "expect", target: "alert", value: "Secret key rejected" },
    { action: "expectAbsent", target: "page", value: "<secret S seed>" }
  ]
} as const;
