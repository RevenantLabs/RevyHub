import type { StellarNetwork } from "@/core/network/types";
import type { AssetIdentity, OfferRow, RationalPrice } from "@/features/offer-liability-headroom/types";

const NETWORK_LABELS: Record<StellarNetwork, string> = {
  testnet: "Testnet",
  mainnet: "Mainnet"
};

export function formatNetworkLabel(network: StellarNetwork): string {
  return NETWORK_LABELS[network];
}

export function formatAssetLabel(asset: AssetIdentity): string {
  return asset.label;
}

export function formatPrice(price: RationalPrice): string {
  return `${price.display} (≈ ${price.approximate})`;
}

export function formatOfferLine(offer: OfferRow): string {
  return `${offer.amount} ${offer.selling.label} → ${offer.buying.label} @ ${offer.price.display}`;
}
