import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { TransactionEnvelopeDiffPanel } from "@/features/transaction-envelope-diff/components/TransactionEnvelopeDiffPanel";
import { copy } from "@/features/transaction-envelope-diff/copy";
import {
  baseXdr,
  changedAmountXdr,
  notBase64
} from "@/features/transaction-envelope-diff/fixtures/envelopeDiff.fixture";

type User = ReturnType<typeof renderFeature>["user"];

async function compare(user: User, left: string, right: string) {
  await user.click(screen.getByLabelText(copy.leftLabel));
  await user.paste(left);
  await user.click(screen.getByLabelText(copy.rightLabel));
  await user.paste(right);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("TransactionEnvelopeDiffPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<TransactionEnvelopeDiffPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a diff on screen", async () => {
    const { container, user } = renderFeature(<TransactionEnvelopeDiffPanel />);

    await compare(user, baseXdr, changedAmountXdr);
    await screen.findByText("tx.operations[0].amount");

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations when the envelopes are identical", async () => {
    const { container, user } = renderFeature(<TransactionEnvelopeDiffPanel />);

    await compare(user, baseXdr, baseXdr);
    await screen.findByText(copy.identicalTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations while showing an error", async () => {
    const { container, user } = renderFeature(<TransactionEnvelopeDiffPanel />);

    await compare(user, baseXdr, notBase64);
    await screen.findByRole("alert");

    await expectNoAxeViolations(container);
  });
});
