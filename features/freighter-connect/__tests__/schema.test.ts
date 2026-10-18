import { describe, expect, it } from "vitest";
import { readFreighterApi } from "@/features/freighter-connect/schema";
import {
  connectedApi,
  incompleteApi,
  windowWith
} from "@/features/freighter-connect/fixtures/freighterConnect.fixture";

describe("readFreighterApi", () => {
  it("rejects an absent extension", () => {
    expect(readFreighterApi(windowWith(undefined))).toEqual({
      ok: false,
      code: "not_installed"
    });
  });

  it("rejects an undefined target", () => {
    expect(readFreighterApi(undefined)).toEqual({ ok: false, code: "not_installed" });
  });

  it("rejects an API missing the methods this tool needs", () => {
    expect(readFreighterApi(windowWith(incompleteApi))).toEqual({
      ok: false,
      code: "api_incomplete"
    });
  });

  it("accepts a complete API", () => {
    const result = readFreighterApi(windowWith(connectedApi));
    expect(result.ok).toBe(true);
  });
});
