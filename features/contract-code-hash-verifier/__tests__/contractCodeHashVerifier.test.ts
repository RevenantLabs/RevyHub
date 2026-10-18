import { expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import { verifyCodeHash } from "../lib/contractCodeHashVerifier";
import { handlers } from "../msw/handlers";
import { builtinContractId } from "../fixtures/builtin-contract.fixture";
import { archivedContractId, contractId, malformedContractId, mismatchContractId, missingContractId, unavailableContractId } from "../fixtures/wasm-contract.fixture";

withMswHandlers(...handlers);

it("matches Wasm bytes and treats a built-in contract as not applicable", async () => {
  const match = await verifyCodeHash(contractId, "testnet");
  expect(match.ok && match.value.verdict).toBe("match");
  expect(match.ok && match.value.atomic).toBe(true);
  const builtin = await verifyCodeHash(builtinContractId, "testnet");
  expect(builtin.ok && builtin.value.verdict).toBe("not_applicable");
  expect(builtin.ok && builtin.value.code).toBeNull();
});

it("reports mismatch, missing, archived, malformed and unavailable entries", async () => {
  const mismatch = await verifyCodeHash(mismatchContractId, "testnet");
  expect(mismatch.ok && mismatch.value.verdict).toBe("mismatch");
  expect(mismatch.ok && mismatch.value.atomic).toBe(false);
  const missing = await verifyCodeHash(missingContractId, "testnet");
  expect(!missing.ok && missing.code).toBe("entry_missing");
  const archived = await verifyCodeHash(archivedContractId, "testnet");
  expect(!archived.ok && archived.code).toBe("entry_archived");
  const malformed = await verifyCodeHash(malformedContractId, "testnet");
  expect(!malformed.ok && malformed.code).toBe("malformed_entry");
  const failed = await verifyCodeHash(unavailableContractId, "testnet");
  expect(!failed.ok && failed.code).toBe("request_failed");
});
