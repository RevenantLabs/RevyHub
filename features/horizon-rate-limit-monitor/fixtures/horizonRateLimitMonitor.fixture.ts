import { Keypair } from "@stellar/stellar-sdk";
import { fullHeaders, healthyHeaders } from "@/features/horizon-rate-limit-monitor/fixtures/full-headers.fixture";
export const accountId = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 7)).publicKey();
export const testnetHeaders = { root: healthyHeaders, ledgers: fullHeaders, account: healthyHeaders };
export const mainnetHeaders = { root: fullHeaders, ledgers: healthyHeaders, account: fullHeaders };
