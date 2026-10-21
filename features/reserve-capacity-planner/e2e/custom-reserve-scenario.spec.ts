/**
 * Edge-case browser journey: a custom base reserve, then a starting balance
 * that cannot cover the projected minimum.
 */
export const spec = {
  route: "/tools/reserve-capacity-planner",
  offline: true,
  steps: [
    { action: "visit", target: "/tools/reserve-capacity-planner" },
    { action: "resize", target: "viewport", value: "390x844" },
    { action: "fill", target: "Trustlines", value: "4" },
    { action: "fill", target: "Offers", value: "1" },
    { action: "fill", target: "Data entries", value: "2" },
    { action: "fill", target: "Signer subentries", value: "3" },
    { action: "fill", target: "Base reserve override (XLM)", value: "1.25" },
    { action: "fill", target: "Starting balance (XLM)", value: "20" },
    { action: "click", target: "Project reserve" },
    {
      action: "expect",
      target: "formula",
      value: "Minimum balance = 1.25 XLM × (2 + 10) = 15 XLM"
    },
    { action: "expect", target: "stroops", value: "12,500,000 stroops × (2 + 10) = 150,000,000 stroops" },
    { action: "expect", target: "note", value: "Using the base reserve you entered." },
    { action: "expect", target: "spendable", value: "5 XLM" },
    { action: "edit", target: "Starting balance (XLM)", value: "0.5" },
    { action: "edit", target: "counts", value: "0" },
    { action: "edit", target: "Base reserve override (XLM)", value: "" },
    { action: "click", target: "Project reserve" },
    {
      action: "expect",
      target: "status",
      value: "Starting balance is below the minimum. Spendable balance is 0 XLM."
    },
    { action: "expect", target: "shortfall", value: "0.5 XLM" },
    { action: "paste", target: "Trustlines", value: "secret seed starting with S" },
    { action: "expect", target: "field cleared" },
    { action: "expect", target: "alert", value: "Remove the secret key." },
    { action: "expect", target: "secret text", value: "absent from the page" }
  ]
} as const;
