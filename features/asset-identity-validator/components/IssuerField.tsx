import { copy } from "@/features/asset-identity-validator/copy";

/** Shows the validated issuer. The value is a public address, never a seed. */
export function IssuerField({ issuer }: { issuer: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wide text-[#4e5c73]">{copy.issuerResultLabel}</p>
      <p
        className="mt-1 break-all font-mono text-xs text-[#172033] sm:text-sm"
        style={{ overflowWrap: "anywhere", wordBreak: "break-all" }}
      >
        {issuer}
      </p>
    </div>
  );
}
