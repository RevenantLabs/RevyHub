import { copy } from "@/features/sep24-transaction-status-tracker/copy";

export function JwtInputWarning() {
  return (
    <p className="rounded-md border border-[#c7d6e8] bg-white/50 p-3 text-sm text-[#172033]">
      <span className="font-medium">{copy.jwtWarningTitle}. </span>
      {copy.jwtWarning}
    </p>
  );
}
