import { expect, it } from "vitest";
import { Buffer } from "buffer";
import { decodeCodeEntry, inspectLedgerResult, MAX_WASM_BYTES } from "../lib/code-entry";
import { codeEntry } from "../fixtures/wasm-contract.fixture";
import { hash } from "@stellar/stellar-sdk";

it("reports missing, archived and malformed entries", () => {
  expect(inspectLedgerResult({ entries: [], latestLedger: 10 })).toMatchObject({ ok: false, code: "entry_missing" });
  const archived = inspectLedgerResult({ entries: [{ xdr: "AAAA", liveUntilLedgerSeq: 1 }], latestLedger: 10 });
  expect(!archived.ok && archived.code).toBe("entry_archived");
  expect(decodeCodeEntry("AAAA")).toMatchObject({ ok: false, code: "malformed_entry" });
});

it("refuses Wasm larger than the local cap without hashing it", () => {
  const wasm = Buffer.alloc(MAX_WASM_BYTES + 1, 7);
  const encoded = codeEntry(hash(Buffer.from("cap")), wasm);
  const decoded = decodeCodeEntry(encoded);
  expect(decoded).toMatchObject({ ok: false, code: "entry_oversized" });
});
