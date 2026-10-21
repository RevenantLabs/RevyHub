import { copy } from "@/features/regulated-asset-inspector/copy";

export function ApprovalCriteriaText({ value }: { value: string }) {
  return (
    <p>
      <span className="text-sm text-white/55">{copy.approvalCriteriaLabel}: </span>
      <span className="text-sm">{value}</span>
    </p>
  );
}
