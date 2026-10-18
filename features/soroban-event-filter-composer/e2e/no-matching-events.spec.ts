/** A valid filter against an empty page is not an error. */
export const spec = {
  route: "/tools/soroban-event-filter-composer",
  steps: [
    { action: "visit", target: "/tools/soroban-event-filter-composer" },
    { action: "fill", target: "contract IDs", value: "the empty-page fixture contract" },
    { action: "fill", target: "start ledger", value: "150" },
    { action: "click", target: "Run filter" },
    { action: "expect", target: "no matching events message, with the retention window and filter preview still visible" }
  ]
} as const;
