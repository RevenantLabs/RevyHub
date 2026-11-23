import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { TransactionBalanceChangeReconcilerPanel } from "@/features/transaction-balance-change-reconciler/components/TransactionBalanceChangeReconcilerPanel";
import { copy, errorCopy } from "@/features/transaction-balance-change-reconciler/copy";
import { unexplainedResidual } from "@/features/transaction-balance-change-reconciler/fixtures/boundary.fixture";
import {
  normalPayment,
  notBase64,
  secretSeed
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

describe("TransactionBalanceChangeReconcilerPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<TransactionBalanceChangeReconcilerPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows deltas and a reconciled status for a valid payment", async () => {
    const { user } = renderFeature(<TransactionBalanceChangeReconcilerPanel />);
    await reconcile(user, normalPayment);

    expect(await screen.findByText(copy.successTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.deltasTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.columnDelta)).toBeInTheDocument();
  });

  it("shows incomplete evidence for an unexplained residual", async () => {
    const { user } = renderFeature(<TransactionBalanceChangeReconcilerPanel />);
    await reconcile(user, unexplainedResidual);

    expect(await screen.findByText(copy.incompleteTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.residualOpen)).toBeInTheDocument();
  });

  it("announces malformed input as an error", async () => {
    const { user } = renderFeature(<TransactionBalanceChangeReconcilerPanel />);
    await reconcile(user, { ...normalPayment, metaXdr: notBase64 });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      errorCopy.malformed_data.title
    );
  });

  it("refuses a secret seed and never echoes it", async () => {
    const { user } = renderFeature(<TransactionBalanceChangeReconcilerPanel />);
    await reconcile(user, { ...normalPayment, envelopeXdr: secretSeed });

    expect(await screen.findByRole("alert")).toHaveTextContent(errorCopy.invalid_input.title);
    expect(screen.queryByDisplayValue(secretSeed)).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain(secretSeed);
  });
});
