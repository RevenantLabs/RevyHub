import { describe, expect, it } from "vitest";
import { withMswHandlers } from "@/core/testing/msw";
import {
  deriveSequenceResult,
  HorizonResponseError,
  inspectSequence
} from "@/features/sequence-inspector/lib/sequenceInspector";
import { toSequenceInspectorErrorCode } from "@/features/sequence-inspector/lib/sequenceInspector.errors";
import {
  handlers,
  horizonUnavailableHandler,
  transportFailureHandler
} from "@/features/sequence-inspector/msw/handlers";
import {
  accountId,
  bumpTarget,
  creationLedger,
  creationLedgerMaximum,
  currentSequence,
  horizonAccount,
  missingAccountId,
  nextSequence,
  offset,
  sequenceUpdatedLedger
} from "@/features/sequence-inspector/fixtures/sequenceInspector.fixture";

const server = withMswHandlers(...handlers);

describe("deriveSequenceResult", () => {
  it("decodes all sequence fields exactly with BigInt", () => {
    const result = deriveSequenceResult(horizonAccount, bumpTarget.toString());

    expect(result).toEqual({
      ok: true,
      value: {
        accountId,
        currentSequence,
        nextSequence,
        creationLedger,
        offset,
        creationLedgerMaximum,
        sequenceUpdatedLedger,
        bumpTarget,
        bumpIncrease: 12_345n,
        bumpChangesLedgerPrefix: false
      }
    });
  });

  it("identifies a bump that changes the encoded ledger prefix", () => {
    const target = creationLedgerMaximum + 1n;
    const result = deriveSequenceResult(horizonAccount, target.toString());
    expect(result.ok && result.value.bumpChangesLedgerPrefix).toBe(true);
  });

  it.each([currentSequence, currentSequence - 1n])(
    "rejects a bump target that does not increase the sequence",
    (target) => {
      expect(deriveSequenceResult(horizonAccount, target.toString())).toEqual({
        ok: false,
        code: "invalid_bump_target"
      });
    }
  );

  it("represents an int64-max account without inventing a next sequence", () => {
    const result = deriveSequenceResult({
      ...horizonAccount,
      sequence: "9223372036854775807"
    });

    expect(result.ok && result.value.nextSequence).toBeNull();
    expect(result.ok && result.value.creationLedgerMaximum).toBe(9_223_372_036_854_775_807n);
  });

  it("returns request_failed for malformed Horizon numeric data", () => {
    expect(deriveSequenceResult({ ...horizonAccount, sequence: "not-an-integer" })).toEqual({
      ok: false,
      code: "request_failed"
    });
  });
});

describe("inspectSequence", () => {
  it("loads and decodes an account from Horizon", async () => {
    const result = await inspectSequence({ accountId }, "testnet");
    expect(result.ok && result.value.currentSequence).toBe(currentSequence);
  });

  it("maps a Horizon 404 to account_not_found", async () => {
    expect(await inspectSequence({ accountId: missingAccountId }, "testnet")).toEqual({
      ok: false,
      code: "account_not_found"
    });
  });

  it("maps a Horizon 5xx to request_failed", async () => {
    server.use(horizonUnavailableHandler);
    expect(await inspectSequence({ accountId }, "testnet")).toEqual({
      ok: false,
      code: "request_failed"
    });
  });

  it("maps a transport failure to request_failed", async () => {
    server.use(transportFailureHandler);
    expect(await inspectSequence({ accountId }, "testnet")).toEqual({
      ok: false,
      code: "request_failed"
    });
  });
});

describe("toSequenceInspectorErrorCode", () => {
  it("reserves account_not_found for a 404", () => {
    expect(toSequenceInspectorErrorCode(new HorizonResponseError(404))).toBe("account_not_found");
  });

  it.each([new Error("request timeout"), new Error("network unavailable"), new Error("unknown")])(
    "maps non-404 failures to request_failed",
    (failure) => {
      expect(toSequenceInspectorErrorCode(failure)).toBe("request_failed");
    }
  );
});
