import { copy } from "@/features/txrep-converter/copy";

export function RoundTripWarning({ matched }: { matched: boolean }) {
  return (
    <p className={matched ? "text-sm text-white/60" : "text-sm font-medium"} role={matched ? undefined : "alert"}>
      {matched ? copy.roundTripOk : copy.roundTripFailed}
    </p>
  );
}
