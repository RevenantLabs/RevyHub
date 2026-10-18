import { Keypair } from "@stellar/stellar-sdk";
import type { AccountActivityRollupResult } from "@/features/account-activity-rollup/types";
import { groupByType, groupByUtcDay } from "@/features/account-activity-rollup/lib/activity-groups";
import { describeHistory } from "@/features/account-activity-rollup/lib/history-boundary";
import { overlappingOperations } from "@/features/account-activity-rollup/fixtures/operations.fixture";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));
export const accountId = seed(31).publicKey();
export const emptyAccountId = seed(32).publicKey();
export const unknownAccountId = seed(33).publicKey();
export const unavailableAccountId = seed(34).publicKey();
export const malformedAccountId = seed(35).publicKey();

export const accountActivityRollupFixture: AccountActivityRollupResult = {
  accountId, network: "testnet", operations: overlappingOperations,
  byType: groupByType(overlappingOperations), byDay: groupByUtcDay(overlappingOperations),
  coverage: describeHistory(overlappingOperations, 1, false), cursor: null
};
