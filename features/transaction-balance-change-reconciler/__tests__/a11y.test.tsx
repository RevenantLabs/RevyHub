import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { TransactionBalanceChangeReconcilerPanel } from "@/features/transaction-balance-change-reconciler/components/TransactionBalanceChangeReconcilerPanel";
import { copy } from "@/features/transaction-balance-change-reconciler/copy";
import { unexplainedResidual } from "@/features/transaction-balance-change-reconciler/fixtures/boundary.fixture";
import {
  normalPayment,
  notBase64
} from "@/features/transaction-balance-change-reconciler/fixtures/normal.fixture";

type User = ReturnType<typeof renderFeature>["user"];

async function fill(user: User, field: string, text: string) {
  await user.click(screen.getByLabelText(field));
  await user.paste(text);
}

async function reconcile(
  user: User,
  input: { envelopeXdr: string; resultXdr: string; metaXdr: string }
) {
  await fill(user, copy.envelopeLabel, input.envelopeXdr);
  await fill(user, copy.resultLabel, input.resultXdr);
  await fill(user, copy.metaLabel, input.metaXdr);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("TransactionBalanceChangeReconcilerPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<TransactionBalanceChangeReconcilerPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a reconciled result on screen", async () => {
    const { container, user } = renderFeature(<TransactionBalanceChangeReconcilerPanel />);

    await reconcile(user, normalPayment);
    await screen.findByText(copy.successTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations for incomplete evidence", async () => {
    const { container, user } = renderFeature(<TransactionBalanceChangeReconcilerPanel />);

    await reconcile(user, unexplainedResidual);
    await screen.findByText(copy.incompleteTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations while showing an error", async () => {
    const { container, user } = renderFeature(<TransactionBalanceChangeReconcilerPanel />);

    await reconcile(user, { ...normalPayment, metaXdr: notBase64 });
    await screen.findByRole("alert");

    await expectNoAxeViolations(container);
  });
});
