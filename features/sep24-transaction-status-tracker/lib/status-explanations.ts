import { copy, statusCopy } from "@/features/sep24-transaction-status-tracker/copy";

export interface StatusExplanation {
  explanation: string;
  nextStep: string;
  documented: boolean;
}

export function explainStatus(status: string): StatusExplanation {
  const known = statusCopy[status];
  if (!known) {
    return { explanation: copy.unknownStatus, nextStep: copy.unknownNext, documented: false };
  }
  return { ...known, documented: true };
}

export function documentedStatuses(): string[] {
  return Object.keys(statusCopy);
}
