import { describe, expect, it } from "vitest";
import { parseLedgerCloseCadenceInput } from "@/features/ledger-close-cadence/schema";
import { SAMPLE_SIZE_MAX, SAMPLE_SIZE_MIN } from "@/features/ledger-close-cadence/types";

describe("parseLedgerCloseCadenceInput", () => {
  it("accepts a whole number inside the supported range", () => {
    expect(parseLedgerCloseCadenceInput({ sampleSize: "20" })).toEqual({
      ok: true,
      value: { sampleSize: 20 }
    });
  });

  it("accepts the inclusive boundaries", () => {
    expect(parseLedgerCloseCadenceInput({ sampleSize: String(SAMPLE_SIZE_MIN) })).toEqual({
      ok: true,
      value: { sampleSize: SAMPLE_SIZE_MIN }
    });
    expect(parseLedgerCloseCadenceInput({ sampleSize: String(SAMPLE_SIZE_MAX) })).toEqual({
      ok: true,
      value: { sampleSize: SAMPLE_SIZE_MAX }
    });
  });

  it.each(["", "  ", "abc", "2.5", "-1", "0", "1", String(SAMPLE_SIZE_MAX + 1)])(
    "rejects invalid sample size %j",
    (sampleSize) => {
      expect(parseLedgerCloseCadenceInput({ sampleSize })).toEqual({
        ok: false,
        code: "invalid_sample_size"
      });
    }
  );
});
