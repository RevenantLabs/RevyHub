/**
 * End-to-end specification for the Testnet Keypair Generator.
 *
 * Written as declarative steps so the intended browser behaviour is reviewable
 * and diffable before a browser runner is wired into CI.
 */
export const spec = {
  route: "/tools/testnet-keypair-generator",
  steps: [
    { action: "visit", target: "/tools/testnet-keypair-generator" },
    { action: "expect", target: "heading", value: "Testnet Keypair Generator" },
    { action: "click", target: "Generate Testnet Keypair" },
    { action: "expect", target: "heading", value: "Generated Testnet Keypair" },
    { action: "expect", target: "text", value: "Testnet Only - Security Notice" },
    { action: "click", target: "Reveal Secret Seed" },
    { action: "expect", target: "button", value: "Hide Secret Seed" },
    { action: "fill", target: "Keypair Label (optional)", value: "SBZ2O7LMWTY3X3T32SZZK52F4E7U6W23EOGQOES52Z5H7R774H7NVRN2" },
    { action: "click", target: "Generate Testnet Keypair" },
    { action: "expect", target: "alert", value: "Secret key prohibited" }
  ]
} as const;
