/**
 * End-to-end specification for the Soroban Contract Metadata Viewer tool.
 *
 * Documented as executable steps so the behaviour is reviewable even before a
 * browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/contract-metadata-viewer",
  steps: [
    { action: "visit", target: "/tools/contract-metadata-viewer" },
    { action: "expect", target: "heading", value: "Soroban Contract Metadata Viewer" },
    { action: "click", target: "submit" },
    { action: "expect", target: "alert" }
  ]
} as const;
