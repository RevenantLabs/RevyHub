import { copy } from "@/features/testnet-keypair-generator/copy";

export function KeypairGeneratorEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[#d1d5db] bg-[#f9fafb] p-8 text-center">
      <h3 className="text-base font-semibold text-[#172033]">{copy.emptyTitle}</h3>
      <p className="mt-1 text-sm text-[#68758a]">{copy.emptyDescription}</p>
    </div>
  );
}
