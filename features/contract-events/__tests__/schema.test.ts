import { describe, expect, it } from "vitest";
import { parseContractEventsInput } from "@/features/contract-events/schema";
import { contractId } from "@/features/contract-events/fixtures/contractEvents.fixture";

describe("parseContractEventsInput", () => {
  it("rejects an empty contract ID", () => {
    const result = parseContractEventsInput({
      contractId: "   ",
      startLedger: "100",
      endLedger: "200"
    });
    expect(result).toEqual({ ok: false, code: "empty_contract_id" });
  });

  it("rejects an invalid contract ID", () => {
    const result = parseContractEventsInput({
      contractId: "not-a-contract",
      startLedger: "100",
      endLedger: "200"
    });
    expect(result).toEqual({ ok: false, code: "invalid_contract_id" });
  });

  it("rejects a public key that is not a contract ID", () => {
    const result = parseContractEventsInput({
      contractId: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHGA",
      startLedger: "100",
      endLedger: "200"
    });
    expect(result).toEqual({ ok: false, code: "invalid_contract_id" });
  });

  it("rejects missing ledger numbers", () => {
    const result = parseContractEventsInput({ contractId, startLedger: "", endLedger: "200" });
    expect(result).toEqual({ ok: false, code: "invalid_ledger_range" });
  });

  it("rejects negative ledgers", () => {
    const result = parseContractEventsInput({ contractId, startLedger: "-1", endLedger: "200" });
    expect(result).toEqual({ ok: false, code: "invalid_ledger_range" });
  });

  it("rejects a start ledger greater than the end ledger", () => {
    const result = parseContractEventsInput({ contractId, startLedger: "200", endLedger: "100" });
    expect(result).toEqual({ ok: false, code: "invalid_ledger_range" });
  });

  it("rejects fractional ledger numbers", () => {
    const result = parseContractEventsInput({
      contractId,
      startLedger: "100.5",
      endLedger: "200"
    });
    expect(result).toEqual({ ok: false, code: "invalid_ledger_range" });
  });

  it("accepts a valid contract ID and range", () => {
    const result = parseContractEventsInput({ contractId, startLedger: "100", endLedger: "200" });
    expect(result).toEqual({
      ok: true,
      value: { contractId, startLedger: 100, endLedger: 200 }
    });
  });
});
