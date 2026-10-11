/**
 * End-to-end specification for the Contract Storage and TTL Inspector tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/contract-storage",
  steps: [
    { action: "visit", target: "/tools/contract-storage" },
    { action: "expect", target: "heading", value: "Contract Storage and TTL Inspector" },
    { action: "type", target: "Contract ID", value: "CABC...XYZ" },
    { action: "click", target: "Inspect storage" },
    { action: "expect", target: "table" }
  ]
} as const;
