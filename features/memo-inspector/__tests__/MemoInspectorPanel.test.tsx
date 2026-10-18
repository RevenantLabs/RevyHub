import { Memo } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import { fireEvent, renderFeature, screen } from "@/core/testing/render";
import { MemoInspectorPanel } from "@/features/memo-inspector/components/MemoInspectorPanel";
import { copy, errorCopy, segmentLabels } from "@/features/memo-inspector/copy";
import { formatByteCount } from "@/features/memo-inspector/lib/format";
import { TEXT_MAX_BYTES } from "@/features/memo-inspector/lib/memoInspector";
import {
  hashBase64,
  hashBytes,
  hashHex,
  overMaxMemoId,
  secretKey,
  shortHashHex,
  textOverByteLimit
} from "@/features/memo-inspector/fixtures/memoInspector.fixture";

const submitButton = () => screen.getByRole("button", { name: copy.submit });
const valueField = (kind: keyof typeof copy.valueLabels) =>
  screen.getByLabelText(copy.valueLabels[kind]);

describe("MemoInspectorPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<MemoInspectorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("counts the text memo in bytes as the user types", async () => {
    const { user } = renderFeature(<MemoInspectorPanel />);

    expect(screen.getByText(formatByteCount(0, TEXT_MAX_BYTES))).toBeInTheDocument();

    await user.type(valueField("text"), "abc");
    expect(screen.getByText(formatByteCount(3, TEXT_MAX_BYTES))).toBeInTheDocument();

    // Ten rocket emoji are ten characters and forty bytes.
    fireEvent.change(valueField("text"), { target: { value: textOverByteLimit } });
    expect(screen.getByText("40 / 28 bytes — 12 over")).toBeInTheDocument();
  });

  it("encodes a text memo and shows the XDR alongside the input", async () => {
    const { user } = renderFeature(<MemoInspectorPanel />);

    await user.type(valueField("text"), "Invoice 1001");
    await user.click(submitButton());

    const expected = Memo.text("Invoice 1001").toXDRObject().toXDR().toString("base64");
    expect(await screen.findByText(expected)).toBeInTheDocument();
    expect(screen.getAllByText("Invoice 1001").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: `Copy ${copy.xdrBase64Label}` })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: `Copy ${copy.inputRow}` })).toBeInTheDocument();
  });

  it("breaks the encoding down into its labelled byte runs", async () => {
    const { user } = renderFeature(<MemoInspectorPanel />);

    await user.type(valueField("text"), "ab");
    await user.click(submitButton());

    expect(await screen.findByText(segmentLabels.discriminant)).toBeInTheDocument();
    expect(screen.getByText("00 00 00 01")).toBeInTheDocument();
    expect(screen.getByText(segmentLabels.length)).toBeInTheDocument();
    expect(screen.getByText(segmentLabels.padding)).toBeInTheDocument();
  });

  it("encodes MEMO_NONE without asking for a value", async () => {
    const { user } = renderFeature(<MemoInspectorPanel />);

    await user.selectOptions(screen.getByLabelText(copy.kindLabel), "none");
    expect(screen.queryByLabelText(copy.valueLabels.text)).not.toBeInTheDocument();

    await user.click(submitButton());
    expect(await screen.findByText("AAAAAA==")).toBeInTheDocument();
    expect(screen.getAllByText(copy.noValue).length).toBeGreaterThan(0);
  });

  it("encodes a memo id at the top of the uint64 range", async () => {
    const { user } = renderFeature(<MemoInspectorPanel />);

    await user.selectOptions(screen.getByLabelText(copy.kindLabel), "id");
    await user.type(valueField("id"), "18446744073709551615");
    await user.click(submitButton());

    const expected = Memo.id("18446744073709551615").toXDRObject().toXDR().toString("base64");
    expect(await screen.findByText(expected)).toBeInTheDocument();
  });

  it("accepts a hash memo written as base64 and reports how it was read", async () => {
    const { user } = renderFeature(<MemoInspectorPanel />);

    await user.selectOptions(screen.getByLabelText(copy.kindLabel), "hash");
    await user.type(valueField("hash"), hashBase64);
    await user.click(submitButton());

    const expected = Memo.hash(Buffer.from(hashBytes)).toXDRObject().toXDR().toString("base64");
    expect(await screen.findByText(expected)).toBeInTheDocument();
    expect(screen.getByText(copy.base64Encoding)).toBeInTheDocument();
    // Whichever way it was written, the value is echoed as hex.
    expect(screen.getAllByText(hashHex).length).toBeGreaterThan(0);
  });

  it("clears the value when the memo type changes", async () => {
    const { user } = renderFeature(<MemoInspectorPanel />);

    await user.type(valueField("text"), "Invoice 1001");
    await user.selectOptions(screen.getByLabelText(copy.kindLabel), "id");
    expect(valueField("id")).toHaveValue("");
  });

  it("marks the field when a text memo is over the byte limit", async () => {
    const { user } = renderFeature(<MemoInspectorPanel />);

    fireEvent.change(valueField("text"), { target: { value: textOverByteLimit } });
    await user.click(submitButton());

    expect(await screen.findByText(errorCopy.text_too_long.title)).toBeInTheDocument();
    expect(valueField("text")).toHaveAttribute("aria-invalid", "true");
  });

  it.each([
    ["id", overMaxMemoId, errorCopy.invalid_id.title],
    ["hash", shortHashHex, errorCopy.invalid_hash.title]
  ] as const)("rejects an invalid %s memo with a specific message", async (kind, value, title) => {
    const { user } = renderFeature(<MemoInspectorPanel />);

    await user.selectOptions(screen.getByLabelText(copy.kindLabel), kind);
    await user.type(valueField(kind), value);
    await user.click(submitButton());

    expect(await screen.findByText(title)).toBeInTheDocument();
  });

  it("asks for a value instead of encoding an empty memo", async () => {
    const { user } = renderFeature(<MemoInspectorPanel />);

    await user.click(submitButton());
    expect(await screen.findByText(errorCopy.empty_input.title)).toBeInTheDocument();
  });

  it("never echoes a secret key back to the page", async () => {
    const { user } = renderFeature(<MemoInspectorPanel />);

    await user.type(valueField("text"), secretKey);
    await user.click(submitButton());

    expect(await screen.findByText(errorCopy.text_too_long.title)).toBeInTheDocument();
    expect(screen.queryByText(copy.resultTitle)).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain(secretKey);
  });
});
