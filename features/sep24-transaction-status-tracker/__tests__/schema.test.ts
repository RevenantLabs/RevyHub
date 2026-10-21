import { describe, expect, it } from "vitest";
import { parseSep24TransactionStatusTrackerInput } from "@/features/sep24-transaction-status-tracker/schema";
import {
  expiredToken,
  homeDomain,
  liveToken,
  transactionId
} from "@/features/sep24-transaction-status-tracker/fixtures/sep24TransactionStatusTracker.fixture";

const valid = { homeDomain, transactionId, token: liveToken };

describe("parseSep24TransactionStatusTrackerInput", () => {
  it("accepts a domain, id, and unexpired JWT", () => {
    expect(parseSep24TransactionStatusTrackerInput(valid).ok).toBe(true);
  });

  it("rejects a URL and a slashy transaction id", () => {
    expect(parseSep24TransactionStatusTrackerInput({ ...valid, homeDomain: "https://anchor.example" })).toEqual({
      ok: false,
      code: "invalid_home_domain"
    });
    expect(parseSep24TransactionStatusTrackerInput({ ...valid, transactionId: "a/b" })).toEqual({
      ok: false,
      code: "invalid_transaction_id"
    });
  });

  it("rejects an expired JWT before any request", () => {
    expect(parseSep24TransactionStatusTrackerInput({ ...valid, token: expiredToken })).toEqual({
      ok: false,
      code: "unauthorized"
    });
  });
});
