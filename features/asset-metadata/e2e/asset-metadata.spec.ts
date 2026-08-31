export const spec = {
  route: "/tools/asset-metadata",
  steps: [
    { action: "visit", target: "/tools/asset-metadata" },
    { action: "expect", target: "heading", value: "Asset Metadata Discovery" },
    { action: "fill", target: "Issuer domain", value: "example.com" },
    { action: "click", target: "Read stellar.toml" },
    { action: "expect", target: "text", value: "Declared assets" },
    { action: "expect", target: "text", value: "This is what the domain claims about itself" },
    { action: "fill", target: "Issuer domain", value: "http://example.com" },
    { action: "click", target: "Read stellar.toml" },
    { action: "expect", target: "alert", value: "Only HTTPS is accepted" }
  ]
} as const;
