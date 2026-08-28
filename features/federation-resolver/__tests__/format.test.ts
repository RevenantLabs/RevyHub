import { describe, expect, it } from "vitest";
import {
  formatMemo,
  formatMemoType,
  hostOf,
  requiresMemo
} from "@/features/federation-resolver/lib/format";
import {
  isAbortError,
  toFederationErrorCode,
  FederationNetworkError,
  FederationTimeoutError
} from "@/features/federation-resolver/lib/federation.errors";
import { resolvedAccountId } from "@/features/federation-resolver/fixtures/federationResolver.fixture";

const withMemo = { accountId: resolvedAccountId, memoType: "id" as const, memo: "12345" };
const withoutMemo = { accountId: resolvedAccountId };

describe("formatMemoType", () => {
  it("names each memo type", () => {
    expect(formatMemoType("text")).toBe("Text");
    expect(formatMemoType("return")).toBe("Return hash");
  });

  it("says None when there is no memo type", () => {
    expect(formatMemoType(undefined)).toBe("None");
  });
});

describe("formatMemo", () => {
  it("shows the memo with its type", () => {
    expect(formatMemo(withMemo)).toBe("12345 (ID)");
  });

  it("says None when no memo was returned", () => {
    expect(formatMemo(withoutMemo)).toBe("None");
  });
});

describe("requiresMemo", () => {
  it("is true only when both memo and type are present", () => {
    expect(requiresMemo(withMemo)).toBe(true);
    expect(requiresMemo(withoutMemo)).toBe(false);
    expect(requiresMemo({ accountId: resolvedAccountId, memoType: "id" })).toBe(false);
  });
});

describe("hostOf", () => {
  it("reduces a server URL to its host", () => {
    expect(hostOf("https://federation.example.com/federation")).toBe("federation.example.com");
  });

  it("passes an unparseable value through unchanged", () => {
    expect(hostOf("not a url")).toBe("not a url");
  });
});

describe("toFederationErrorCode", () => {
  it("separates a timeout from a dead server", () => {
    expect(toFederationErrorCode(new FederationTimeoutError())).toBe("timeout");
    expect(toFederationErrorCode(new FederationNetworkError("boom"))).toBe("network_error");
  });

  it("treats an AbortError as a timeout", () => {
    const abort = new Error("aborted");
    abort.name = "AbortError";

    expect(isAbortError(abort)).toBe(true);
    expect(toFederationErrorCode(abort)).toBe("timeout");
  });
});
