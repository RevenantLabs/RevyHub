export const spec = {
  route: "/tools/asset-descriptor-codec",
  steps: [
    { action: "visit", target: "/tools/asset-descriptor-codec" },
    { action: "expect", target: "heading", value: "Classic Asset Descriptor and XDR Codec" },
    { action: "fill", target: "Asset representation", value: "native" },
    { action: "click", target: "Encode asset" },
    { action: "expect", target: "text", value: "Canonical asset identity and encodings" },
    { action: "expect", target: "text", value: "AAAAAA==" },
    { action: "click", target: "Decode XDR" },
    { action: "fill", target: "Asset representation", value: "AAAAAA==" },
    { action: "click", target: "Decode XDR" },
    { action: "expect", target: "text", value: "native" },
    { action: "expectNoRequest", target: "network" }
  ]
} as const;
