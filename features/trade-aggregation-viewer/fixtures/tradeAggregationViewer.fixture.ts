import { Keypair } from "@stellar/stellar-sdk";
import type { TradeAggregationViewerResult } from "@/features/trade-aggregation-viewer/types";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));
export const issuerId = seed(42).publicKey();
export const baseAsset = { type: "native" as const };
export const counterAsset = { type: "credit" as const, code: "USDC", issuer: issuerId };
export const pairInput = JSON.stringify({ base: "native", counter: counterAsset, resolution: 3_600_000, offsetHours: 0, startTime: "2026-08-31T00:00:00Z", endTime: "2026-09-01T00:00:00Z" });

export const aggregationResponse = {
  _embedded: {
    records: [{ timestamp: 1_788_134_400_000, trade_count: 12, base_volume: "120.0000000", counter_volume: "60.0000000", open: "0.49", high: "0.55", low: "0.48", close: "0.5", open_r: { n: 49, d: 100 }, high_r: { n: 11, d: 20 }, low_r: { n: 12, d: 25 }, close_r: { n: 1, d: 2 } }]
  }
};
export const emptyAggregationResponse = { _embedded: { records: [] } };

export const tradeAggregationViewerFixture: TradeAggregationViewerResult = {
  base: baseAsset, counter: counterAsset, resolution: 3_600_000, offsetHours: 0, requestedStart: "2026-08-31T00:00:00Z", requestedEnd: "2026-09-01T00:00:00Z", usedStart: "2026-08-31T00:00:00.000Z", usedEnd: "2026-08-31T01:00:00.000Z", buckets: [{ timestamp: "2026-08-31T00:00:00.000Z", start: "2026-08-31T00:00:00.000Z", end: "2026-08-31T01:00:00.000Z", open: "49/100", high: "11/20", low: "12/25", close: "1/2", openFraction: { numerator: "49", denominator: "100", display: "49/100" }, highFraction: { numerator: "11", denominator: "20", display: "11/20" }, lowFraction: { numerator: "12", denominator: "25", display: "12/25" }, closeFraction: { numerator: "1", denominator: "2", display: "1/2" }, baseVolume: "120", counterVolume: "60", tradeCount: 12 }], totalBaseVolume: "120", totalCounterVolume: "60", totalTrades: 12, noTrades: false, network: "testnet"
};
