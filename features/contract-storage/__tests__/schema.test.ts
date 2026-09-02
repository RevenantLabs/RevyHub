import { describe, expect, it } from "vitest";
import { parseContractStorageInput } from "@/features/contract-storage/schema";
import { contractId } from "@/features/contract-storage/fixtures/contractStorage.fixture";

describe("parseContractStorageInput", () => {
  it("rejects empty input", () => {
    const result = parseContractStorageInput("   ");
    expect(result).toEqual({ ok: false, code: "empty_contract_id" });
  });

  it("rejects an invalid contract ID", () => {
    const result = parseContractStorageInput("not-a-contract");
    expect(result).toEqual({ ok: false, code: "invalid_contract_id" });
  });

  it("rejects a public key that is not a contract ID", () => {
    const result = parseContractStorageInput(
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHGA"
    );
    expect(result).toEqual({ ok: false, code: "invalid_contract_id" });
  });

  it("normalises surrounding whitespace", () => {
    const result = parseContractStorageInput(`  ${contractId}  `);
    expect(result.ok && result.value.contractId).toBe(contractId);
  });

  it("accepts a valid contract ID", () => {
    const result = parseContractStorageInput(contractId);
    expect(result).toEqual({ ok: true, value: { contractId } });
  });
});
