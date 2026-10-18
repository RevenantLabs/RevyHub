import { describe, expect, it } from "vitest";
import { MAX_SNAPSHOT_LENGTH, parseSnapshotInput } from "@/features/account-snapshot-diff/schema";
import {
  balanceDownJson,
  baseJson,
  malformedJson,
  secretSeed,
  snapshotWithSecretJson
} from "@/features/account-snapshot-diff/fixtures/accountSnapshotDiff.fixture";

const base = { before: baseJson, after: balanceDownJson };

describe("parseSnapshotInput", () => {
  it("requires both snapshots", () => {
    expect(parseSnapshotInput({ ...base, before: "" })).toEqual({
      ok: false,
      code: "empty_input"
    });
    expect(parseSnapshotInput({ ...base, after: "   \n " })).toEqual({
      ok: false,
      code: "empty_input"
    });
  });

  it("trims surrounding whitespace", () => {
    const result = parseSnapshotInput({ ...base, before: `\n  ${baseJson}  \n` });
    expect(result.ok && result.value.before).toBe(baseJson);
  });

  it("refuses a snapshot containing a secret seed without echoing it", () => {
    // The seed is embedded in a JSON document, not pasted alone, so the guard
    // has to match anywhere in the text rather than only at the start.
    const result = parseSnapshotInput({ ...base, before: snapshotWithSecretJson });

    expect(result).toEqual({ ok: false, code: "invalid_input" });
    expect(JSON.stringify(result)).not.toContain(secretSeed);
  });

  it("refuses a bare seed on either side", () => {
    expect(parseSnapshotInput({ ...base, after: secretSeed })).toEqual({
      ok: false,
      code: "invalid_input"
    });
  });

  it("accepts a snapshot exactly at the cap and rejects one past it", () => {
    const atCap = "x".repeat(MAX_SNAPSHOT_LENGTH);
    expect(parseSnapshotInput({ ...base, before: atCap }).ok).toBe(true);
    expect(parseSnapshotInput({ ...base, before: `${atCap}x` })).toEqual({
      ok: false,
      code: "input_too_large"
    });
  });

  it("leaves JSON parsing to the comparison", () => {
    // Malformed JSON is not a shape problem with the *input field* — it is a
    // snapshot problem, and the comparison reports it as invalid_snapshot.
    expect(parseSnapshotInput({ ...base, before: malformedJson }).ok).toBe(true);
  });

  it("accepts two plausible snapshots", () => {
    expect(parseSnapshotInput(base).ok).toBe(true);
  });
});
