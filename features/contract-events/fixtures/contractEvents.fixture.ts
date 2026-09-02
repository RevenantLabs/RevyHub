import { Keypair, StrKey, xdr } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const contractId = StrKey.encodeContract(Buffer.alloc(32, 1));
export const unknownContractId = StrKey.encodeContract(Buffer.alloc(32, 9));
export const ownerAccountId = seed(2).publicKey();

export const latestLedger = 1_000_000;
export const startLedger = latestLedger - 1_000;
export const endLedger = latestLedger;
export const retentionWindow = 17280;

/**
 * Encodes an ScVal to base64 XDR for use in a mocked `getEvents` response.
 */
export function encodeScVal(value: xdr.ScVal): string {
  return value.toXDR("base64");
}

/**
 * Builds a realistic raw event object for tests.
 */
export function contractEventFixture(
  overrides: Partial<{
    id: string;
    ledger: number;
    type: "contract" | "system" | "diagnostic";
    contractId: string;
    topic: xdr.ScVal[];
    value: xdr.ScVal;
    successful: boolean;
  }> = {}
): {
  id: string;
  ledger: number;
  ledgerClosedAt: string;
  contractId: string;
  type: string;
  pagingToken: string;
  topic: string[];
  value: string;
  inSuccessfulContractCall: boolean;
} {
  const topic = overrides.topic ?? [xdr.ScVal.scvSymbol("transfer")];
  const value = overrides.value ?? xdr.ScVal.scvU32(42);

  const id = overrides.id ?? "0000000298790f6ae7b9e4b00000000";

  return {
    id,
    ledger: overrides.ledger ?? endLedger - 50,
    ledgerClosedAt: new Date("2026-09-01T12:00:00Z").toISOString(),
    contractId: overrides.contractId ?? contractId,
    type: overrides.type ?? "contract",
    pagingToken: id,
    topic: topic.map(encodeScVal),
    value: encodeScVal(value),
    inSuccessfulContractCall: overrides.successful ?? true
  };
}

/** A realistic `getEvents` response for the fixture contract. */
export function getEventsResponse(
  events: ReturnType<typeof contractEventFixture>[] = [contractEventFixture()]
): { latestLedger: number; events: ReturnType<typeof contractEventFixture>[] } {
  return { latestLedger, events };
}

/** A response with no matching events. */
export function emptyEventsResponse(): { latestLedger: number; events: [] } {
  return { latestLedger, events: [] };
}
