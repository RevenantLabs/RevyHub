/**
 * End-to-end specification for the Horizon Pagination Response Inspector.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/horizon-pagination-inspector",
  steps: [
    { action: "visit", target: "/tools/horizon-pagination-inspector" },
    {
      action: "expect",
      target: "heading",
      value: "Horizon Pagination Response Inspector"
    },
    { action: "expect", target: "text", value: "No response inspected yet" },
    { action: "fill", target: "Horizon collection response", value: "<complete page JSON>" },
    { action: "click", target: "Inspect response" },
    { action: "expect", target: "text", value: "3 records" },
    { action: "expect", target: "text", value: "Increasing in page order" },
    { action: "expect", target: "text", value: "Present — more pages may follow" },
    {
      action: "fill",
      target: "Horizon collection response",
      value: "<short page JSON that still carries a next link>"
    },
    { action: "click", target: "Inspect response" },
    { action: "expect", target: "text", value: "1 record" },
    { action: "expect", target: "text", value: "Present — more pages may follow" },
    {
      action: "fill",
      target: "Horizon collection response",
      value: "<response with no links object>"
    },
    { action: "click", target: "Inspect response" },
    { action: "expect", target: "text", value: "This response carries no paging links" },
    { action: "expectNoRequest", target: "network" }
  ]
} as const;
