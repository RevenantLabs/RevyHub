import { copy } from "@/features/asset-identity-validator/copy";
import { formatCanonicalAssetString } from "@/features/asset-identity-validator/lib/format";

/** Shows the full canonical `code:issuer` string, wrapping on a narrow viewport. */
export function CanonicalAssetString({ value }: { value: string }) {
  const formatted = formatCanonicalAssetString(value);

  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wide text-[#4e5c73]">{copy.canonicalLabel}</p>
      <p
        className="mt-1 break-all font-mono text-xs text-[#172033] sm:text-sm"
        style={{ overflowWrap: "anywhere", wordBreak: "break-all" }}
      >
        {formatted}
      </p>
    </div>
  );
}
