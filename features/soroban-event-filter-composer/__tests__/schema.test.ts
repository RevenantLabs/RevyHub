import { expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";
import { parseInput } from "../schema";
import { contractId } from "../fixtures/sorobanEventFilterComposer.fixture";
import { tooManyTopics } from "../fixtures/event-filters.fixture";

const base = { contractIds: contractId, eventType: "All", topics: "*", startLedger: "150", limit: "10", cursor: "" };

it("accepts a wildcard filter", () => {
  const parsed = parseInput(base, "testnet");
  expect(parsed.ok).toBe(true);
});

it("rejects a secret seed before any other check", () => {
  const seed = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 3)).secret();
  const parsed = parseInput({ ...base, contractIds: seed }, "testnet");
  expect(parsed.ok).toBe(false);
  if (!parsed.ok) expect(parsed.code).toBe("invalid_contract_id");
  expect(JSON.stringify(parsed)).not.toContain(seed);
});

it("rejects a bad contract id, topic and start ledger", () => {
  expect(parseInput({ ...base, contractIds: "not-a-contract" }, "testnet").ok && false).toBe(false);
  const topic = parseInput({ ...base, topics: "nope" }, "testnet");
  const ledger = parseInput({ ...base, startLedger: "0" }, "testnet");
  const crowded = parseInput(tooManyTopics, "testnet");
  if (!topic.ok) expect(topic.code).toBe("invalid_topic");
  if (!ledger.ok) expect(ledger.code).toBe("invalid_start_ledger");
  if (!crowded.ok) expect(crowded.code).toBe("invalid_topic");
});
