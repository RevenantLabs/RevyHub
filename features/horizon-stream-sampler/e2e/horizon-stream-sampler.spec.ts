/**
 * End-to-end specification for the Horizon Stream Sampler tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/horizon-stream-sampler",
  steps: [
    { action: "visit", target: "/tools/horizon-stream-sampler" },
    { action: "expect", target: "heading", value: "Horizon Stream Sampler" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
