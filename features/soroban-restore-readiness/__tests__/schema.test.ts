import { expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";
import { parseInput } from "../schema";
import { sample } from "../fixtures/sorobanRestoreReadiness.fixture";
import { malformedStorageKeyXdr } from "../fixtures/sorobanRestoreReadiness.fixture";

it("accepts valid input", () => {
  const result = parseInput(sample);
  expect(result.ok).toBe(true);
});

it("rejects a secret key on the contract ID field before any request", () => {
  const seed = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 8)).secret();
  const result = parseInput({ contractId: seed, storageKeyXdr: sample.storageKeyXdr, durability: "persistent" });
  expect(!result.ok && result.code).toBe("invalid_contract_id");
  expect(JSON.stringify(result)).not.toContain(seed);
});

it("rejects a malformed contract ID", () => {
  const result = parseInput({ contractId: "CABC", storageKeyXdr: sample.storageKeyXdr, durability: "persistent" });
  expect(!result.ok && result.code).toBe("invalid_contract_id");
});

it("rejects an empty storage key", () => {
  const result = parseInput({ contractId: sample.contractId, storageKeyXdr: "", durability: "persistent" });
  expect(!result.ok && result.code).toBe("invalid_storage_key");
});

it("rejects a storage key that does not decode as ScVal XDR", () => {
  const result = parseInput({ contractId: sample.contractId, storageKeyXdr: malformedStorageKeyXdr, durability: "persistent" });
  expect(!result.ok && result.code).toBe("invalid_storage_key");
});

it("rejects an unknown durability", () => {
  const result = parseInput({ contractId: sample.contractId, storageKeyXdr: sample.storageKeyXdr, durability: "eternal" });
  expect(!result.ok && result.code).toBe("invalid_storage_key");
});

it("defaults durability to persistent when omitted", () => {
  const result = parseInput({ contractId: sample.contractId, storageKeyXdr: sample.storageKeyXdr, durability: "" });
  expect(result.ok && result.value.durability).toBe("persistent");
});
