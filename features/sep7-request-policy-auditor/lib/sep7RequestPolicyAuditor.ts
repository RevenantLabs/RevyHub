import { ok, type Result } from "@/core/result/result";
import type { AuditReport, ErrorCode } from "../types";
import { parsePolicy } from "./policy-rules";
import { buildVerdicts } from "./policy-verdict";
import { parseSep7Uri } from "./uri-fields";

export function auditRequest(uri: string, policy: string): Result<AuditReport, ErrorCode> {
  const fields = parseSep7Uri(uri);
  if (!fields.ok) return fields;
  const rules = parsePolicy(policy);
  if (!rules.ok) return rules;
  return ok({ fields: fields.value, policy: rules.value, verdicts: buildVerdicts(fields.value, rules.value) });
}
