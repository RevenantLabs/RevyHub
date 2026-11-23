/** Browser journey specification; the project does not run these declarative specs in CI. */
export const spec = { route: "/tools/soroban-auth-nonce-expiry-auditor", steps: [
  {action: "visit", target: "/tools/soroban-auth-nonce-expiry-auditor"},
  {action: "expect", target: "text", value: "Nothing audited yet"},
  {action: "fill", target: "Authorization entries XDR", value: "<two valid address entries with equal identity and nonce>"},
  {action: "fill", target: "Evaluation ledger", value: "100"},
  {action: "click", target: "Audit entries"},
  {action: "expect", target: "text", value: "Repeated address nonces"},
  {action: "fill", target: "Evaluation ledger", value: ""},
  {action: "click", target: "Audit entries"},
  {action: "expect", target: "text", value: "Incomplete evidence"},
  {action: "fill", target: "Authorization entries XDR", value: "bad XDR"},
  {action: "click", target: "Audit entries"},
  {action: "expect", target: "alert", value: "Check the input"},
  {action: "expectNoRequest", target: "network"}
] } as const;
