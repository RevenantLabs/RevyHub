import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { AccountMergeValueReconcilerPanel } from "../components/AccountMergeValueReconcilerPanel";
import { copy } from "../copy";
import { normalInput } from "../fixtures/normal.fixture";
import { failedInput } from "../fixtures/boundary.fixture";

type User = ReturnType<typeof renderFeature>["user"];
async function submit(user: User, input: typeof normalInput) {
  for (const [label, value] of [[copy.envelopeLabel, input.envelope], [copy.resultLabel, input.resultXdr], [copy.metadataLabel, input.metadataXdr]]) {
    await user.click(screen.getByLabelText(label));
    await user.paste(value);
  }
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("reconciliation accessibility", () => {
  it("has no WCAG A/AA violations initially", async () => {
    const { container } = renderFeature(<AccountMergeValueReconcilerPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with an error", async () => {
    const { container, user } = renderFeature(<AccountMergeValueReconcilerPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("alert");
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a complete result", async () => {
    const { container, user } = renderFeature(<AccountMergeValueReconcilerPanel />);
    await submit(user, normalInput);
    await screen.findByText(copy.completeTitle);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with incomplete evidence", async () => {
    const { container, user } = renderFeature(<AccountMergeValueReconcilerPanel />);
    await submit(user, failedInput);
    await screen.findByText(copy.incompleteTitle);
    await expectNoAxeViolations(container);
  });
});
