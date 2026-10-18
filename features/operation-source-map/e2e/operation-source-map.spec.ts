export const spec = {
  route: "/tools/operation-source-map",
  steps: [
    { action: "visit", target: "/tools/operation-source-map" },
    { action: "expect", target: "heading", value: "Transaction Operation Source Map" },
    { action: "expect", target: "text", value: "No envelope mapped yet" },

    // A mixed envelope: some operations inherit, one overrides.
    { action: "fill", target: "Transaction envelope XDR", value: "<base64 v1 envelope>" },
    { action: "click", target: "Map operation sources" },
    { action: "expect", target: "text", value: "Transaction source (inherited default)" },
    { action: "expect", target: "list", value: "Operations" },
    { action: "expect", target: "text", value: "Inherited" },
    { action: "expect", target: "text", value: "Overridden" },

    // Filters narrow the view without changing the map.
    { action: "select", target: "Show", value: "Overridden only" },
    { action: "expectNotVisible", target: "text", value: "Inherited" },
    { action: "select", target: "Show", value: "Inherited only" },
    { action: "expectNotVisible", target: "text", value: "Overridden" },

    // A filter that matches nothing offers a way back.
    { action: "fill", target: "Transaction envelope XDR", value: "<base64 envelope, no overrides>" },
    { action: "click", target: "Map operation sources" },
    { action: "select", target: "Show", value: "Overridden only" },
    { action: "expect", target: "text", value: "No operations match this filter" },
    { action: "click", target: "Reset filter" },
    { action: "expect", target: "text", value: "Inherited" },

    // A fee bump: inner source is the default, fee payer stays separate.
    { action: "fill", target: "Transaction envelope XDR", value: "<base64 fee-bump envelope>" },
    { action: "click", target: "Map operation sources" },
    { action: "expect", target: "text", value: "Fee paid by" },
    { action: "expect", target: "text", value: "Grouped by effective source" },

    // The JSON export is produced locally.
    { action: "expect", target: "button", value: "Copy JSON summary" },

    { action: "expectNoRequest", target: "network" }
  ]
} as const;
