import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { PaymentReceiptReconcilerPanel } from "@/features/payment-receipt-reconciler/components/PaymentReceiptReconcilerPanel";
import { copy, errorCopy } from "@/features/payment-receipt-reconciler/copy";
import { handlers } from "@/features/payment-receipt-reconciler/msw/handlers";
import {
  failedHash,
  missingHash,
  successfulHash,
  unsupportedHash
} from "@/features/payment-receipt-reconciler/fixtures/paymentReceiptReconciler.fixture";
import { mixedEffectsHash } from "@/features/payment-receipt-reconciler/fixtures/mixed-effects.fixture";

withMswHandlers(...handlers);

describe("PaymentReceiptReconcilerPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<PaymentReceiptReconcilerPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("renders operations, effects, totals and a public receipt", async () => {
    const { user } = renderFeature(<PaymentReceiptReconcilerPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), successfulHash);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.publicReceiptTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.operationsTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.effectsTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.totalsTitle)).toBeInTheDocument();
    expect(screen.getByText("100 stroops (0.00001 XLM)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: copy.copyReceipt })).toBeInTheDocument();
  });

  it("surfaces outside items for mixed transactions", async () => {
    const { user } = renderFeature(<PaymentReceiptReconcilerPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), mixedEffectsHash);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.outsideTitle)).toBeInTheDocument();
    expect(screen.getByText("change trust")).toBeInTheDocument();
    expect(screen.getByText("trade")).toBeInTheDocument();
  });

  it("explains a failed transaction", async () => {
    const { user } = renderFeature(<PaymentReceiptReconcilerPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), failedHash);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.transaction_failed.title)).toBeInTheDocument();
  });

  it("explains an unsupported operation set", async () => {
    const { user } = renderFeature(<PaymentReceiptReconcilerPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), unsupportedHash);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.unsupported_operation.title)).toBeInTheDocument();
  });

  it("explains that a hash is not an account address", async () => {
    const { user } = renderFeature(<PaymentReceiptReconcilerPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), "GABC");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.invalid_hash.title)).toBeInTheDocument();
  });

  it("points at the network switch when a hash is not found", async () => {
    const { user } = renderFeature(<PaymentReceiptReconcilerPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), missingHash);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.transaction_not_found.title)).toBeInTheDocument();
  });
});
