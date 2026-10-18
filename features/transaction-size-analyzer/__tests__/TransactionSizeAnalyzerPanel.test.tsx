import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { TransactionSizeAnalyzerPanel } from "@/features/transaction-size-analyzer/components/TransactionSizeAnalyzerPanel";
import { copy, errorCopy, sectionLabels } from "@/features/transaction-size-analyzer/copy";
import {
  feeBumpXdr,
  notBase64,
  signedXdr,
  singleOperationXdr,
  twoOperationXdr
} from "@/features/transaction-size-analyzer/fixtures/transactionSize.fixture";

type User = ReturnType<typeof renderFeature>["user"];

async function measure(user: User, envelope: string, budget?: string) {
  await user.click(screen.getByLabelText(copy.envelopeLabel));
  await user.paste(envelope);

  if (budget !== undefined) {
    await user.click(screen.getByLabelText(copy.budgetLabel));
    await user.paste(budget);
  }

  await user.click(screen.getByRole("button", { name: copy.submit }));
}

const measuredBytes = Buffer.from(singleOperationXdr, "base64").length;

describe("TransactionSizeAnalyzerPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<TransactionSizeAnalyzerPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows the byte total and explains the base64 difference", async () => {
    const { user } = renderFeature(<TransactionSizeAnalyzerPanel />);
    await measure(user, twoOperationXdr);

    expect(await screen.findByText(copy.totalsTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.base64Note)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `Copy ${copy.copyTotal}` })
    ).toBeInTheDocument();
  });

  it("itemises the sections and shows they add up", async () => {
    const { user } = renderFeature(<TransactionSizeAnalyzerPanel />);
    await measure(user, signedXdr);

    expect(await screen.findByText(copy.outerTitle)).toBeInTheDocument();
    expect(screen.getByText(sectionLabels.transaction_body)).toBeInTheDocument();
    expect(screen.getByText(sectionLabels.operations)).toBeInTheDocument();
    expect(screen.getByText(sectionLabels.signatures)).toBeInTheDocument();
    expect(screen.getByText(copy.labelSectionTotal)).toBeInTheDocument();
    expect(screen.getByText(copy.sumNote)).toBeInTheDocument();
  });

  it("shows inner and outer sections for a fee bump and says the inner is counted once", async () => {
    const { user } = renderFeature(<TransactionSizeAnalyzerPanel />);
    await measure(user, feeBumpXdr);

    expect(await screen.findByText(copy.innerTitle)).toBeInTheDocument();
    expect(screen.getByText(sectionLabels.inner_envelope)).toBeInTheDocument();
    expect(screen.getByText(sectionLabels.fee_bump_body)).toBeInTheDocument();
    expect(screen.getByText(copy.innerNote)).toBeInTheDocument();
  });

  it("lists per-operation and per-signature sizes", async () => {
    const { user } = renderFeature(<TransactionSizeAnalyzerPanel />);
    await measure(user, signedXdr);

    expect(await screen.findByText(/^Operation 1 — /)).toBeInTheDocument();
    expect(screen.getByText(/^Operation 2 — /)).toBeInTheDocument();
    expect(screen.getByText(/^Signature 1 — /)).toBeInTheDocument();
  });

  it("says so plainly when there are no signatures", async () => {
    const { user } = renderFeature(<TransactionSizeAnalyzerPanel />);
    await measure(user, twoOperationXdr);

    expect(await screen.findByText(copy.noSignatures)).toBeInTheDocument();
  });

  it("reports headroom against a generous budget", async () => {
    const { user } = renderFeature(<TransactionSizeAnalyzerPanel />);
    await measure(user, singleOperationXdr, String(measuredBytes + 100));

    expect(await screen.findByText(copy.budgetOkTitle)).toBeInTheDocument();
    expect(screen.getByText(/100 bytes of headroom/)).toBeInTheDocument();
    expect(screen.getByText(copy.budgetNote)).toBeInTheDocument();
  });

  it("reports overage against a tight budget without claiming rejection", async () => {
    const { user } = renderFeature(<TransactionSizeAnalyzerPanel />);
    await measure(user, singleOperationXdr, String(measuredBytes - 10));

    expect(await screen.findByText(copy.budgetOverTitle)).toBeInTheDocument();
    expect(screen.getByText(/10 bytes over/)).toBeInTheDocument();
    // A budget is the user's own limit, never a network guarantee.
    expect(screen.getByText(copy.budgetNote)).toBeInTheDocument();
  });

  it("shows no budget section when the field is left blank", async () => {
    const { user } = renderFeature(<TransactionSizeAnalyzerPanel />);
    await measure(user, singleOperationXdr);

    await screen.findByText(copy.totalsTitle);
    expect(screen.queryByText(copy.budgetTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(copy.budgetOkTitle)).not.toBeInTheDocument();
  });

  it("refuses a budget that is not a whole number of bytes", async () => {
    const { user } = renderFeature(<TransactionSizeAnalyzerPanel />);
    await measure(user, singleOperationXdr, "1e3");

    expect(await screen.findByText(errorCopy.invalid_budget.title)).toBeInTheDocument();
  });

  it("explains a bad paste", async () => {
    const { user } = renderFeature(<TransactionSizeAnalyzerPanel />);
    await measure(user, notBase64);

    expect(await screen.findByText(errorCopy.invalid_input.title)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
