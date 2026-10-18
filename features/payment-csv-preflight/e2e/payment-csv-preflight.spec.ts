/**
 * End-to-end specification for the Payment CSV Import Preflight tool.
 *
 * Written as executable steps so the intended behaviour is reviewable before a
 * browser runner is wired into CI. Every step is offline: the tool must not
 * issue a single request, so a passing run is also a network assertion.
 */
export const spec = {
  route: "/tools/payment-csv-preflight",
  steps: [
    { action: "visit", target: "/tools/payment-csv-preflight" },
    { action: "expect", target: "heading", value: "Payment CSV Import Preflight" },
    { action: "expect", target: "text", value: "No payout file checked yet" },

    { action: "paste", target: "textarea", value: "valid three-row payout CSV from the fixture" },
    { action: "click", target: "submit" },
    { action: "expect", target: "text", value: "Summary" },
    { action: "expect", target: "text", value: "3 valid · 0 invalid · 0 duplicate" },
    { action: "expect", target: "text", value: "11.5", note: "exact XLM total, not 11.499999" },
    { action: "expect", target: "network", value: "no requests made" },

    { action: "click", target: "button", value: "Download JSON", note: "export is offered" },

    { action: "click", target: "button", value: "Clear" },
    { action: "paste", target: "textarea", value: "CSV with one 8-decimal amount" },
    { action: "click", target: "submit" },
    { action: "expect", target: "text", value: "Export is blocked while rows are invalid" },
    { action: "select", target: "Show rows", value: "invalid" },
    { action: "expect", target: "text", value: "Stellar amounts carry at most 7 decimal places" },

    { action: "click", target: "button", value: "Clear" },
    { action: "upload", target: "file input", value: "payout.csv with a secret key in a row" },
    { action: "expect", target: "text", value: "Secret key — not shown" },
    { action: "expect", target: "absent", value: "the pasted seed anywhere in the document" },

    { action: "click", target: "button", value: "Clear" },
    { action: "click", target: "submit", note: "nothing pasted" },
    { action: "expect", target: "alert", value: "Add a payout file first" }
  ]
} as const;
