import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { TransactionEnvelopeDiffPanel } from "@/features/transaction-envelope-diff/components/TransactionEnvelopeDiffPanel";
import { copy, errorCopy, sectionLabels } from "@/features/transaction-envelope-diff/copy";
import {
  baseXdr,
  changedAmountXdr,
  feeBumpXdr,
  higherFeeBumpXdr,
  notBase64,
  reorderedXdr,
  secretSeed,
  signedXdr,
  whitespaceXdr
} from "@/features/transaction-envelope-diff/fixtures/envelopeDiff.fixture";

type User = ReturnType<typeof renderFeature>["user"];

async function fill(user: User, field: string, text: string) {
  await user.click(screen.getByLabelText(field));
  await user.paste(text);
}

async function compare(user: User, left: string, right: string) {
  await fill(user, copy.leftLabel, left);
  await fill(user, copy.rightLabel, right);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("TransactionEnvelopeDiffPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<TransactionEnvelopeDiffPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows the changed field and its before and after values", async () => {
    const { user } = renderFeature(<TransactionEnvelopeDiffPanel />);
    await compare(user, baseXdr, changedAmountXdr);

    expect(await screen.findByText("tx.operations[0].amount")).toBeInTheDocument();
    expect(screen.getByText("10.5000000")).toBeInTheDocument();
    expect(screen.getByText("10.6000000")).toBeInTheDocument();
    expect(screen.getByText(sectionLabels.operations)).toBeInTheDocument();
  });

  it("calls two envelopes identical when only whitespace differs", async () => {
    const { user } = renderFeature(<TransactionEnvelopeDiffPanel />);
    await compare(user, baseXdr, whitespaceXdr);

    expect(await screen.findByText(copy.identicalTitle)).toBeInTheDocument();
  });

  it("announces a signature-only difference", async () => {
    const { user } = renderFeature(<TransactionEnvelopeDiffPanel />);
    await compare(user, baseXdr, signedXdr);

    expect(await screen.findByText(copy.signaturesOnlyTitle)).toBeInTheDocument();
    expect(screen.getByText(sectionLabels.signatures)).toBeInTheDocument();
    // The body is untouched, so no body rows are shown under the default filter.
    expect(screen.queryByText(sectionLabels.body)).not.toBeInTheDocument();
  });

  it("treats a reordering as a change", async () => {
    const { user } = renderFeature(<TransactionEnvelopeDiffPanel />);
    await compare(user, baseXdr, reorderedXdr);

    expect(await screen.findByText(copy.orderNote)).toBeInTheDocument();
    expect(screen.queryByText(copy.identicalTitle)).not.toBeInTheDocument();
    expect(screen.getByText("tx.operations[0].type")).toBeInTheDocument();
  });

  it("warns when the two sides are different kinds of envelope", async () => {
    const { user } = renderFeature(<TransactionEnvelopeDiffPanel />);
    await compare(user, baseXdr, feeBumpXdr);

    expect(await screen.findByText(copy.kindChangedTitle)).toBeInTheDocument();
  });

  it("keeps a fee bump's outer change off the inner layer", async () => {
    const { user } = renderFeature(<TransactionEnvelopeDiffPanel />);
    await compare(user, feeBumpXdr, higherFeeBumpXdr);

    expect(await screen.findByText("outer.maxFee")).toBeInTheDocument();
    expect(screen.getByText(copy.layerNote)).toBeInTheDocument();
    expect(screen.queryByText("inner.fee")).not.toBeInTheDocument();
  });

  it("switches between changed and unchanged rows", async () => {
    const { user } = renderFeature(<TransactionEnvelopeDiffPanel />);
    await compare(user, baseXdr, changedAmountXdr);

    await screen.findByText("tx.operations[0].amount");

    await user.selectOptions(screen.getByLabelText(copy.filterLabel), "unchanged");
    expect(screen.queryByText("tx.operations[0].amount")).not.toBeInTheDocument();
    expect(screen.getByText("tx.sequence")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(copy.filterLabel), "all");
    expect(screen.getByText("tx.operations[0].amount")).toBeInTheDocument();
  });

  it("shows a no-match state with a reset that recovers from it", async () => {
    const { user } = renderFeature(<TransactionEnvelopeDiffPanel />);
    await compare(user, baseXdr, baseXdr);

    // Identical envelopes have nothing changed, and "changed" is the default.
    expect(await screen.findByText(copy.noMatchTitle)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(copy.filterLabel), "all");
    expect(screen.queryByText(copy.noMatchTitle)).not.toBeInTheDocument();
  });

  it("offers a copyable deterministic JSON export", async () => {
    const { user } = renderFeature(<TransactionEnvelopeDiffPanel />);
    await compare(user, baseXdr, changedAmountXdr);

    expect(
      await screen.findByRole("button", { name: `Copy ${copy.copyExport}` })
    ).toBeInTheDocument();
    expect(screen.getByText(copy.exportDescription)).toBeInTheDocument();
  });

  it("says which side failed to decode", async () => {
    const { user } = renderFeature(<TransactionEnvelopeDiffPanel />);
    await compare(user, baseXdr, notBase64);

    expect(await screen.findByText(errorCopy.invalid_right_xdr.title)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("refuses a pasted secret key and clears it out of the field", async () => {
    const { container, user } = renderFeature(<TransactionEnvelopeDiffPanel />);
    await compare(user, secretSeed, baseXdr);

    expect(await screen.findByText(errorCopy.invalid_input.title)).toBeInTheDocument();
    expect(screen.getByLabelText<HTMLTextAreaElement>(copy.leftLabel).value).toBe("");
    expect(container.textContent ?? "").not.toContain(secretSeed);
  });
});
