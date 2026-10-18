export const spec = {
  route: "/tools/federation-resolver",
  steps: [
    { action: "visit", target: "/tools/federation-resolver" },
    { action: "expect", target: "heading", value: "Federation Address Resolver" },
    { action: "fill", target: "Federation address", value: "alice*example.com" },
    { action: "click", target: "Resolve address" },
    { action: "expect", target: "text", value: "Resolved account" },
    { action: "expect", target: "text", value: "How this was resolved" },
    { action: "fill", target: "Federation address", value: "not-an-address" },
    { action: "click", target: "Resolve address" },
    { action: "expect", target: "alert", value: "That is not a federation address" }
  ]
} as const;
