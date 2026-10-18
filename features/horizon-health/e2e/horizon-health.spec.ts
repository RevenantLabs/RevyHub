/** Reviewable browser specification; this repository has no E2E runner configured. */
export const spec = {
 route: "/tools/horizon-health",
 steps: [
  {action: "visit", target: "/tools/horizon-health"},
  {action: "mock", target: "configured testnet Horizon root", value: "core=1000, history=990, elder=100; rate remaining=0"},
  {action: "click", target: "Check endpoint"},
  {action: "expect", target: "results", value: "lag=10, degraded warning, history 100–990, remaining=0"},
  {action: "switch", target: "network", value: "mainnet"},
  {action: "expect", target: "initial state", value: "no testnet values"},
  {action: "mock", target: "mainnet root", value: "503"},
  {action: "click", target: "Check endpoint"},
  {action: "expect", target: "alert", value: "retry guidance"},
  {action: "click", target: "Reset"},
  {action: "expect", target: "initial state"}
 ]
} as const;
