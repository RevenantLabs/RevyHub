import type { ErrorCode } from "./types";
export const copy = {
  "balanceBlock":"Clear the balance before deletion.",
  "buyingBlock":"Clear buying liabilities before deletion.",
  "sellingBlock":"Clear selling liabilities before deletion.",
  "limitBlock":"Raise the proposed limit to at least balance plus buying liabilities.",
  "authorizationWarning":"This row is not authorized for receiving; numeric headroom does not grant authorization.",
  "authorizationUnknown":"Receiving authorization is unknown in this snapshot.",
  "unknown":"Absent / unknown", "yes":"Yes", "no":"No",
  "blocked":"Blocked by snapshot commitments",
  "deletionCandidate":"Deletion candidate; additional validity checks required",
  "limitCandidate":"Numeric limit constraint satisfied; additional checks required",
  "noBlockers":"No numeric blocker in this snapshot. Verify complete transaction validity separately.",
  "title": "Trustline Limit Change Planner",
  "description": "Compare a pasted credit trustline snapshot with a proposed limit using exact seven-decimal amounts. Snapshot constraints cannot prove complete transaction validity, current authorization or live network state.",
  "submit": "Analyze",
  "loading": "Analyzing…",
  "reset": "Reset",
  "emptyTitle": "Ready to inspect",
  "emptyDescription": "Compare a pasted credit trustline snapshot with a proposed limit using exact seven-decimal amounts. Snapshot constraints cannot prove complete transaction validity, current authorization or live network state.",
  "resultTitle": "Analysis result",
  "report": "Local JSON report",
  "download": "Download JSON report",
  "noRows": "No matching rows",
  "all": "All rows",
  "filter": "Filter results",
  "rejected": "Sensitive input discarded. Enter only public data.",
  "fields": {
    "snapshot": {
      "label": "Credit balance-row JSON",
      "hint": "Paste one credit_alphanum4 or credit_alphanum12 row. Maximum 65536 characters; balance, limit and both liabilities are required.",
      "multiline": true
    },
    "limit": {
      "label": "Proposed limit",
      "hint": "Nonnegative Stellar amount, at most seven decimals; zero requests deletion."
    }
  },
  "labels": {
    "asset": "Asset identity",
    "balance": "Current balance",
    "currentLimit": "Current limit",
    "proposedLimit": "Proposed limit",
    "buying": "Buying liabilities",
    "selling": "Selling liabilities",
    "currentHeadroom": "Current receiving headroom",
    "proposedHeadroom": "Proposed receiving headroom",
    "minimum": "Minimum committed limit",
    "status": "Snapshot constraint result",
    "constraints": "Actionable constraints",
    "authorized": "Authorized",
    "maintain": "Authorized to maintain liabilities",
    "clawback": "Clawback enabled",
    "caveat": "Snapshot limitation"
  }
} as const;
export const errorCopy: Record<ErrorCode,{title:string;description:string}> = {
  "empty_input": {
    "title": "Empty input",
    "description": "Paste a credit balance row and proposed limit."
  },
  "invalid_input": {
    "title": "Invalid input",
    "description": "Use a valid credit asset code, public issuer, JSON object and exact nonnegative Stellar amounts."
  },
  "input_too_large": {
    "title": "Input too large",
    "description": "Keep the JSON within 65536 characters and the limit within 30 characters."
  },
  "unsupported_balance_type": {
    "title": "Unsupported balance type",
    "description": "Native XLM has no trustline limit; liquidity-pool share rows require pool-specific handling. Supply a credit asset row."
  },
  "incomplete_snapshot": {
    "title": "Incomplete snapshot",
    "description": "Include balance, current limit, buying_liabilities and selling_liabilities. Missing commitments cannot be assumed zero."
  },
  "invalid_limit": {
    "title": "Invalid limit",
    "description": "Enter a nonnegative decimal with at most seven places, no exponent, and at most 922337203685.4775807."
  }
};
