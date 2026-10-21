import { copy } from "@/features/sep38-quote-viewer/copy";
import { formatAssetIdentity, formatIndicativePrice } from "@/features/sep38-quote-viewer/lib/format";
import type { OffChainAsset, OnChainAsset } from "@/features/sep38-quote-viewer/types";

export function IndicativePrice({
  price,
  sellAsset,
  buyAsset,
  offChain,
  onChain
}: {
  price: string;
  sellAsset: string;
  buyAsset: string;
  offChain: OffChainAsset;
  onChain: OnChainAsset;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <p className="text-sm font-bold text-[#4e5c73]">{copy.priceLabel}</p>
      <p className="break-all text-2xl font-bold tracking-tight text-[#172033] sm:text-3xl">
        {formatIndicativePrice(price)}
      </p>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-xs font-bold text-[#4e5c73]">{copy.sellAssetLabel}</dt>
          <dd className="break-all text-sm text-[#172033]">{sellAsset}</dd>
          <dd className="break-all text-xs text-[#68758a]">
            {sellAsset === offChain.canonical ? formatAssetIdentity(offChain) : formatAssetIdentity(onChain)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs font-bold text-[#4e5c73]">{copy.buyAssetLabel}</dt>
          <dd className="break-all text-sm text-[#172033]">{buyAsset}</dd>
          <dd className="break-all text-xs text-[#68758a]">
            {buyAsset === onChain.canonical ? formatAssetIdentity(onChain) : formatAssetIdentity(offChain)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
