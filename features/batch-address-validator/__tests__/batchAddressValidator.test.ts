import { describe, expect, it } from "vitest";
import { cleanUniquePublicAddresses, runBatchAddressValidator } from "@/features/batch-address-validator/lib/batchAddressValidator";
import {
  batchAddressValidatorFixture,
  commaSeparatedInput,
  mixedAddressList,
  newlineSeparatedInput,
  secretSeed,
  secretSeedList,
  spaceSeparatedInput
} from "@/features/batch-address-validator/fixtures/batchAddressValidator.fixture";
import {
  secondPublicKey,
  truncatedPublicKey,
  validPublicKey
} from "@/features/address-validator/fixtures/addressValidator.fixture";
import { parseBatchAddressValidatorInput } from "@/features/batch-address-validator/schema";

describe("runBatchAddressValidator", () => {
  it("validates each line independently", () => {
    const result = runBatchAddressValidator({ lines: mixedAddressList });

    expect(result.summary.total).toBe(4);
    expect(result.summary.valid).toBe(3);
    expect(result.summary.invalid).toBe(1);
    expect(result.lines[0]).toMatchObject({ line: 1, valid: true, code: "valid" });
    expect(result.lines[2]).toMatchObject({
      line: 3,
      valid: false,
      code: "bad_checksum_or_length"
    });
  });

  it("detects duplicate addresses with line numbers", () => {
    const result = runBatchAddressValidator({ lines: mixedAddressList });

    expect(result.summary.duplicated).toBe(2);
    expect(result.lines[0].duplicateLines).toEqual([1, 4]);
    expect(result.lines[3].duplicateLines).toEqual([1, 4]);
  });

  it("rejects secret seeds without echoing them back", () => {
    const result = runBatchAddressValidator({ lines: secretSeedList });

    expect(result.summary.secretSeeds).toBe(1);
    expect(result.lines[1]).toMatchObject({
      line: 2,
      valid: false,
      code: "secret_seed_rejected",
      address: ""
    });
    expect(JSON.stringify(result)).not.toContain(secretSeed);
  });

  it("matches the deterministic fixture", () => {
    expect(runBatchAddressValidator({ lines: mixedAddressList })).toEqual(batchAddressValidatorFixture);
  });
});

describe("parseBatchAddressValidatorInput separators", () => {
  it.each([
    ["comma", commaSeparatedInput, [validPublicKey, secondPublicKey]],
    ["space", spaceSeparatedInput, [validPublicKey, secondPublicKey]],
    ["newline", newlineSeparatedInput, [validPublicKey, secondPublicKey]]
  ])("splits %s-separated input", (_label, raw, expected) => {
    const parsed = parseBatchAddressValidatorInput(raw);
    expect(parsed.ok && parsed.value.lines).toEqual(expected);
  });

});

describe("runBatchAddressValidator edge cases", () => {
  it("marks unsupported kinds as invalid with the same code as the single validator", () => {
    const result = runBatchAddressValidator({ lines: [truncatedPublicKey] });
    expect(result.lines[0].code).toBe("bad_checksum_or_length");
  });
});

describe("cleanUniquePublicAddresses", () => {
  it("returns unique valid G-addresses in first-occurrence order", () => {
    const result = runBatchAddressValidator({ lines: mixedAddressList });
    expect(cleanUniquePublicAddresses(result)).toEqual([validPublicKey, secondPublicKey]);
  });

  it("never includes rejected secret seeds", () => {
    const result = runBatchAddressValidator({ lines: secretSeedList });
    expect(cleanUniquePublicAddresses(result)).toEqual([validPublicKey]);
  });
});
