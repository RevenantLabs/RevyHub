/**
 * End-to-end specification for the Horizon Pagination Response Inspector tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/horizon-pagination-inspector",
  steps: [
    { action: "visit", target: "/tools/horizon-pagination-inspector" },
    { action: "expect", target: "heading", value: "Horizon Pagination Response Inspector" },
    { action: "expect", target: "text", value: "No collection inspected yet" },

    { action: "fill", target: "Horizon Collection JSON", value: "<valid collection json>" },
    { action: "click", target: "Inspect collection" },
    { action: "expect", target: "text", value: "Collection Overview" },
    { action: "expect", target: "text", value: "Records & Identifiers" },
    { action: "expect", target: "text", value: "Pagination Links" },
    { action: "expect", target: "text", value: "Diagnostic JSON Export" },
    { action: "expect", target: "button", value: "Copy diagnostic JSON" },

    { action: "fill", target: "Expected Base Origin (optional)", value: "https://horizon.stellar.org" },
    { action: "click", target: "Inspect collection" },
    { action: "expect", target: "text", value: "Collection Overview" },

    { action: "fill", target: "Horizon Collection JSON", value: "invalid json" },
    { action: "click", target: "Inspect collection" },
    { action: "expect", target: "alert", value: "Malformed JSON" },

    { action: "expectNoRequest", target: "network" }
  ]
} as const;
