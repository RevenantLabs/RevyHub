import { describe, expect, it } from "vitest";
import {
  MAX_COLLECTION_LENGTH,
  MAX_ORIGIN_LENGTH,
  parseHorizonPaginationInput
} from "@/features/horizon-pagination-inspector/schema";
import {
  secretSeed,
  validCollectionJson
} from "@/features/horizon-pagination-inspector/fixtures/horizonPaginationInspector.fixture";

describe("parseHorizonPaginationInput", () => {
  it("rejects empty collection input", () => {
    const result = parseHorizonPaginationInput({
      collection: "   ",
      expectedOrigin: ""
    });
    expect(result).toEqual({ ok: false, code: "empty_input" });
  });

  it("rejects collection exceeding maximum length", () => {
    const hugeCollection = "a".repeat(MAX_COLLECTION_LENGTH + 1);
    const result = parseHorizonPaginationInput({
      collection: hugeCollection,
      expectedOrigin: ""
    });
    expect(result).toEqual({ ok: false, code: "input_too_large" });
  });

  it("rejects origin exceeding maximum origin length", () => {
    const hugeOrigin = `https://horizon.stellar.org/${"a".repeat(MAX_ORIGIN_LENGTH)}`;
    const result = parseHorizonPaginationInput({
      collection: validCollectionJson,
      expectedOrigin: hugeOrigin
    });
    expect(result).toEqual({ ok: false, code: "input_too_large" });
  });

  it("rejects collection containing a secret seed", () => {
    const payloadWithSecret = `{"seed":"${secretSeed}"}`;
    const result = parseHorizonPaginationInput({
      collection: payloadWithSecret,
      expectedOrigin: ""
    });
    expect(result).toEqual({ ok: false, code: "invalid_input" });
  });

  it("rejects expected origin containing a secret seed", () => {
    const result = parseHorizonPaginationInput({
      collection: validCollectionJson,
      expectedOrigin: `https://example.com/?key=${secretSeed}`
    });
    expect(result).toEqual({ ok: false, code: "invalid_input" });
  });

  it("rejects invalid origin schemes", () => {
    const result = parseHorizonPaginationInput({
      collection: validCollectionJson,
      expectedOrigin: "javascript:alert(1)"
    });
    expect(result).toEqual({ ok: false, code: "invalid_input" });
  });

  it("rejects unparseable origin strings", () => {
    const result = parseHorizonPaginationInput({
      collection: validCollectionJson,
      expectedOrigin: "not a url"
    });
    expect(result).toEqual({ ok: false, code: "invalid_input" });
  });

  it("accepts valid collection without origin", () => {
    const result = parseHorizonPaginationInput({
      collection: validCollectionJson,
      expectedOrigin: ""
    });
    expect(result).toEqual({
      ok: true,
      value: {
        collectionText: validCollectionJson,
        expectedOrigin: null
      }
    });
  });

  it("normalizes valid expected origin", () => {
    const result = parseHorizonPaginationInput({
      collection: validCollectionJson,
      expectedOrigin: "https://horizon.stellar.org/subpath?query=1"
    });
    expect(result).toEqual({
      ok: true,
      value: {
        collectionText: validCollectionJson,
        expectedOrigin: "https://horizon.stellar.org"
      }
    });
  });
});
