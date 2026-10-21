import { copy } from "@/features/sep38-quote-viewer/copy";
import { formatExpiration } from "@/features/sep38-quote-viewer/lib/format";

export function QuoteExpiration({ expiresAt }: { expiresAt?: string }) {
  if (!expiresAt) {
    return <p className="text-sm text-[#4e5c73]">{copy.noExpiration}</p>;
  }

  return (
    <p className="text-sm text-[#172033]">
      <span className="font-bold text-[#4e5c73]">{copy.expirationLabel}</span>{" "}
      <time dateTime={expiresAt}>{formatExpiration(expiresAt)}</time>
    </p>
  );
}
