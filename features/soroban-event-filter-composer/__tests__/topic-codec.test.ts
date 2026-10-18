import { expect, it } from "vitest";
import { xdr } from "@stellar/stellar-sdk";
import { decodeTopicXdr, encodeTopicSelector } from "../lib/topic-codec";
import { topicSymbol, topicXdr } from "../fixtures/sorobanEventFilterComposer.fixture";

it("encodes wildcards and symbols and decodes them back", () => {
  const wildcard = encodeTopicSelector("*");
  const symbol = encodeTopicSelector(`sym:${topicSymbol}`);
  expect(wildcard.ok && wildcard.value).toBe("*");
  expect(symbol.ok && symbol.value).toBe(topicXdr);
  const decoded = decodeTopicXdr(topicXdr);
  expect(decoded.ok && decoded.value).toBe(`symbol ${topicSymbol}`);
});

it("rejects a symbol that is too long and a non-canonical topic", () => {
  expect(encodeTopicSelector(`sym:${"a".repeat(33)}`).ok).toBe(false);
  expect(decodeTopicXdr("aaaa").ok).toBe(false);
  const padded = xdr.ScVal.scvU32(1).toXDR("base64") + "AAAA";
  expect(encodeTopicSelector(padded).ok).toBe(false);
});
