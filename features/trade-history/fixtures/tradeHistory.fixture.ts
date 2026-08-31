import { Keypair } from "@stellar/stellar-sdk";
import type { TradeHistoryResult } from "@/features/trade-history/types";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));
export const baseAccount = seed(51).publicKey();
export const counterAccount = seed(52).publicKey();
export const issuerId = seed(53).publicKey();
export const accountFilter = baseAccount;
export const pairInput = JSON.stringify({ base: "native", counter: { code: "USDC", issuer: issuerId }, limit: 2 });
export const accountInput = JSON.stringify({ account: accountFilter, limit: 2 });

export const firstTrade = {
  id: "1001", paging_token: "cursor-1001", ledger_close_time: "2026-08-31T12:00:00Z", base_account: baseAccount, base_amount: "10.0000000", base_asset_type: "native", counter_account: counterAccount, counter_amount: "5.0000000", counter_asset_type: "credit_alphanum4", counter_asset_code: "USDC", counter_asset_issuer: issuerId, base_is_seller: true, price: { n: 1, d: 2 }, price_r: { n: 1, d: 2 }, offer_id: "42", transaction_hash: "a".repeat(64)
};
export const secondTrade = { ...firstTrade, id: "1002", paging_token: "cursor-1002", ledger_close_time: "2026-08-31T11:00:00Z", base_is_seller: false, price: { n: 3, d: 5 }, price_r: { n: 3, d: 5 }, offer_id: "43" };
export const poolTrade = { ...firstTrade, id: "1003", paging_token: "cursor-1003", trade_type: "liquidity_pool", liquidity_pool_id: "d".repeat(64), offer_id: undefined, base_is_seller: false };
export const pageOneResponse = { _embedded: { records: [firstTrade, secondTrade] }, _links: { next: { href: "https://horizon-testnet.stellar.org/trades?cursor=cursor-next" }, prev: { href: "" } } };
export const pageTwoResponse = { _embedded: { records: [poolTrade] }, _links: { next: { href: "" }, prev: { href: "https://horizon-testnet.stellar.org/trades?cursor=cursor-prev" } } };
export const emptyResponse = { _embedded: { records: [] }, _links: { next: { href: "" }, prev: { href: "" } } };

export const tradeHistoryFixture: TradeHistoryResult = {
  records: [], total: 0, page: 1, pageSize: 2, limit: 2, filterMode: "pair", base: { type: "native" }, counter: { type: "credit", code: "USDC", issuer: issuerId }, nextCursor: undefined, previousCursor: undefined, hasNext: false, hasPrevious: false, noTrades: true, network: "testnet"
};
