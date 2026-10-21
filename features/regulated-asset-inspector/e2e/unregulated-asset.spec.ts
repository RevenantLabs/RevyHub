export const spec = {
  route: "/tools/regulated-asset-inspector",
  steps: [
    { action: "visit", target: "/tools/regulated-asset-inspector" },
    { action: "expect", target: "heading", value: "SEP-8 Regulated Asset Inspector" },
    { action: "expect", target: "text", value: "No asset inspected yet" }
  ]
} as const;
