import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  TransactionDetails,
  type TransactionMemo,
  type TransactionSummary
} from "../../components/stellar/TransactionDetails";

const baseTransaction: TransactionSummary = {
  hash: "a".repeat(64),
  ledger: 123456,
  sourceAccount: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
  feeCharged: "100",
  createdAt: "2024-01-01T00:00:00Z",
  successful: true,
  network: "testnet",
  operationCount: 1,
  memo: { type: "none", value: null }
};

function renderSummary(memo: TransactionMemo) {
  return renderToStaticMarkup(
    <TransactionDetails transaction={{ ...baseTransaction, memo }} />
  );
}

describe("TransactionDetails memo rendering", () => {
  it("renders a clear none memo state", () => {
    const html = renderSummary({ type: "none", value: null });

    expect(html).toContain("Memo type");
    expect(html).toContain("None");
    expect(html).toContain("No memo attached");
  });

  it("renders text memo content as plain text", () => {
    const html = renderSummary({ type: "text", value: "Invoice 1001" });

    expect(html).toContain("Text");
    expect(html).toContain("Invoice 1001");
  });

  it("escapes text memo markup so it cannot inject HTML", () => {
    const html = renderSummary({
      type: "text",
      value: "<img src=x onerror=alert(1)>"
    });

    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html).not.toContain("<img src=x onerror=alert(1)>");
  });

  it("renders id memo values clearly", () => {
    const html = renderSummary({ type: "id", value: "424242" });

    expect(html).toContain("ID");
    expect(html).toContain("424242");
  });

  it("renders hash memos as truncated copyable values", () => {
    const memoHash = "b".repeat(64);
    const html = renderSummary({ type: "hash", value: memoHash });

    expect(html).toContain("Hash");
    expect(html).toContain(`title="${memoHash}"`);
    expect(html).toContain("Copy transaction memo");
  });

  it("renders return-hash memos as truncated copyable values", () => {
    const returnHash = "c".repeat(64);
    const html = renderSummary({ type: "return", value: returnHash });

    expect(html).toContain("Return hash");
    expect(html).toContain(`title="${returnHash}"`);
    expect(html).toContain("Copy transaction memo");
  });
});
