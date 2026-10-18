import type { AuditReport, Policy, Sep7Fields } from "../types";

export function formatFields(fields: Sep7Fields): string {
  return [fields.operation, fields.destination, fields.amount || "0", fields.networkPassphrase].join("\n");
}

export function formatPolicy(policy: Policy): string {
  return `${policy.minAmount}–${policy.maxAmount}`;
}

export function formatReport(report: AuditReport): string {
  return JSON.stringify({ destination: report.fields.destination, verdicts: report.verdicts.map((item) => item.code) });
}
