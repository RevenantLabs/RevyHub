import { describe, expect, it } from "vitest";
import { renderFeature, screen, within } from "@/core/testing/render";
import { AccountMergeValueReconcilerPanel } from "../components/AccountMergeValueReconcilerPanel";
import { copy, errorCopy, gapCopy, statusCopy } from "../copy";
import { feeSource, normalInput } from "../fixtures/normal.fixture";
import { failedInput, feeBumpInput, metaV4Xdr, missingMetadataInput, mixedInput, payee } from "../fixtures/boundary.fixture";

type User = ReturnType<typeof renderFeature>["user"];
async function fill(user: User, input = normalInput) {
  for (const [label, value] of [[copy.envelopeLabel, input.envelope], [copy.resultLabel, input.resultXdr], [copy.metadataLabel, input.metadataXdr]]) {
    const field = screen.getByLabelText(label);
    await user.clear(field);
    if (value) {
      await user.click(field);
      await user.paste(value);
    }
  }
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("reconciliation panel", () => {
  it("shows complete two-merge results with separate totals", async () => {
    const { user } = renderFeature(<AccountMergeValueReconcilerPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    await fill(user);
    expect(await screen.findByText(copy.completeTitle)).toBeInTheDocument();
    expect(screen.getByText("3.0000003")).toBeInTheDocument();
    expect(screen.getByText("0.0000200")).toBeInTheDocument();
    expect(screen.getAllByText(statusCopy.success)).toHaveLength(2);
    expect(screen.getByText(copy.unrelatedEmpty)).toBeInTheDocument();
    expect(screen.queryByText(copy.gapsTitle)).not.toBeInTheDocument();
  });

  it("shows the fee-bump payer separately", async () => {
    const { user } = renderFeature(<AccountMergeValueReconcilerPanel />);
    await fill(user, feeBumpInput);
    await screen.findByText(copy.completeTitle);
    expect(screen.getByText(feeSource.publicKey())).toBeInTheDocument();
    expect(screen.getByText("0.0000500")).toBeInTheDocument();
  });

  it("itemises unrelated changes and inherited sources", async () => {
    const { user } = renderFeature(<AccountMergeValueReconcilerPanel />);
    await fill(user, mixedInput);
    await screen.findByText(copy.completeTitle);
    expect(screen.getByText(copy.inherited)).toBeInTheDocument();
    expect(screen.getByText(payee.publicKey())).toBeInTheDocument();
    expect(screen.getByText("5.0000000")).toBeInTheDocument();
    expect(screen.getByText("-5.0000000")).toBeInTheDocument();
  });

  it("shows incomplete metadata separately from a zero total", async () => {
    const { user } = renderFeature(<AccountMergeValueReconcilerPanel />);
    await fill(user, missingMetadataInput);
    expect(await screen.findByText(copy.incompleteTitle)).toBeInTheDocument();
    expect(screen.getByText(gapCopy.missing_metadata)).toBeInTheDocument();
    expect(screen.getAllByText(copy.unavailable).length).toBeGreaterThan(0);
  });

  it("reports failed and rolled-back merges explicitly", async () => {
    const { user } = renderFeature(<AccountMergeValueReconcilerPanel />);
    await fill(user, failedInput);
    expect(await screen.findByText(copy.incompleteTitle)).toBeInTheDocument();
    expect(screen.getByText(statusCopy.rolled_back)).toBeInTheDocument();
    expect(screen.getByText(statusCopy.failed)).toBeInTheDocument();
    expect(screen.getByText(gapCopy.transaction_failed)).toBeInTheDocument();
    expect(screen.getByText("0.0000000")).toBeInTheDocument();
  });

  it("shows actionable errors", async () => {
    const { user } = renderFeature(<AccountMergeValueReconcilerPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText(errorCopy.invalid_input.title)).toBeInTheDocument();
    await fill(user, { ...normalInput, metadataXdr: metaV4Xdr });
    expect(await screen.findByText(errorCopy.unsupported_variant.title)).toBeInTheDocument();
  });

  it("renders pasted text inertly", async () => {
    const { user } = renderFeature(<AccountMergeValueReconcilerPanel />);
    await fill(user, { ...normalInput, envelope: "<img src=x onerror=alert(1)>" });
    expect(await screen.findByText(errorCopy.invalid_input.title)).toBeInTheDocument();
    expect(document.querySelector("img")).toBeNull();
  });
});
