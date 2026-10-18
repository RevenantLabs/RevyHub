import { Keypair } from "@stellar/stellar-sdk";
import type { OrderbookViewerResult } from "@/features/orderbook-viewer/types";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));
export const issuerId = seed(41).publicKey();
export const sellingAsset = { type: "native" as const };
export const buyingAsset = { type: "credit" as const, code: "USDC", issuer: issuerId };
export const pairInput = JSON.stringify({ selling: "native", buying: buyingAsset, limit: 20 });

export const orderbookResponse = {
  bids: [
    { price: "0.99", price_r: { n: 99, d: 100 }, amount: "100.0000000" },
    { price: "0.98", price_r: { n: 49, d: 50 }, amount: "50.0000000" }
  ],
  asks: [
    { price: "1.01", price_r: { n: 101, d: 100 }, amount: "80.0000000" },
    { price: "1.02", price_r: { n: 51, d: 50 }, amount: "40.0000000" }
  ]
};

export const emptyOrderbookResponse = { bids: [], asks: [] };

export const orderbookViewerFixture: OrderbookViewerResult = {
  selling: sellingAsset,
  buying: buyingAsset,
  bids: [{ price: "99/100", priceNumerator: "99", priceDenominator: "100", priceDecimal: "0.99", amount: "100", total: "100" }],
  asks: [{ price: "101/100", priceNumerator: "101", priceDenominator: "100", priceDecimal: "1.01", amount: "80", total: "80" }],
  bestBid: "99/100",
  bestAsk: "101/100",
  spread: "1/50",
  spreadPercent: "2.02%",
  midPrice: "1",
  imbalancePercent: "11.11%",
  empty: false,
  network: "testnet"
};
