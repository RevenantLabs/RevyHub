import { describe, expect, it } from "vitest";
import { inspectSequence } from "@/features/sequence-inspector/lib/sequenceInspector";
import { accountId, missingAccountId } from "@/features/sequence-inspector/fixtures/sequenceInspector.fixture";
import { withMswHandlers } from "@/core/testing/msw";
import { serverErrorHandler, handlers } from "@/features/sequence-inspector/msw/handlers";

const server = withMswHandlers(...handlers);

describe("inspectSequence", () => {
  it("returns sequence info for a valid input", async () => {
    const result = await inspectSequence({ accountId }, "testnet");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.sequence).toBe("18659541252046848");
      expect(result.value.ledger).toBe("4344513");
      expect(result.value.offset).toBe("0");
      expect(result.value.nextSequence).toBe("18659541252046849");
    }
  });

  it("returns error for missing account", async () => {
    const result = await inspectSequence({ accountId: missingAccountId }, "testnet");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("account_not_found");
    }
  });

  it("returns error for server error", async () => {
    server.use(serverErrorHandler);
    const result = await inspectSequence({ accountId }, "testnet");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("request_failed");
    }
  });

  it("validates bump target greater than current sequence", async () => {
    const result = await inspectSequence({ accountId, bumpTarget: "18659541252046849" }, "testnet");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.bumpTarget).toBe("18659541252046849");
    }
  });

  it("rejects bump target less than or equal to current sequence", async () => {
    const result = await inspectSequence({ accountId, bumpTarget: "18659541252046848" }, "testnet");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("invalid_bump_target");
    }
  });
});
