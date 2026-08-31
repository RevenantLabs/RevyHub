export interface Sep10InspectorInput {
  xdr: string;
}

export type Sep10RuleStatus = "pass" | "fail";

export interface Sep10Rule {
  name: string;
  status: Sep10RuleStatus;
  detail: string;
}

export interface Sep10InspectorResult {
  summary: string;
  valid: boolean;
  sequence: string;
  serverSigningAccount?: string;
  timeBounds?: { minTime: string; maxTime: string };
  operations: Array<{ type: string; name?: string; value?: string; source?: string }>;
  rules: Sep10Rule[];
  network?: string;
}

export type Sep10InspectorErrorCode =
  | "empty_input"
  | "invalid_xdr"
  | "not_a_challenge"
  | "expired_challenge"
  | "malformed_challenge"
  | "request_failed";
