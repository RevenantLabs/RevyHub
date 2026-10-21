export const spec = {
  route: "/tools/regulated-asset-inspector",
  steps: [
    { action: "visit", target: "/tools/regulated-asset-inspector" },
    { action: "expect", target: "heading", value: "SEP-8 Regulated Asset Inspector" },
    { action: "click", target: "Inspect regulated status" },
    { action: "expect", target: "alert", value: "Enter a valid issuer account" }
  ]
} as const;
