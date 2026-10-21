import { copy } from "@/features/regulated-asset-inspector/copy";

export function ApprovalServerInfo({ value }: { value: string }) {
  return (
    <p>
      <span className="text-sm text-white/55">{copy.approvalServerLabel}: </span>
      <span className="break-all font-mono text-sm">{value}</span>
    </p>
  );
}
