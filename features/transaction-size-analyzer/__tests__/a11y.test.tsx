import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { TransactionSizeAnalyzerPanel } from "@/features/transaction-size-analyzer/components/TransactionSizeAnalyzerPanel";
import { copy } from "@/features/transaction-size-analyzer/copy";
import {
  feeBumpXdr,
  notBase64,
  singleOperationXdr
} from "@/features/transaction-size-analyzer/fixtures/transactionSize.fixture";

const measuredBytes = Buffer.from(singleOperationXdr, "base64").length;

describe("TransactionSizeAnalyzerPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<TransactionSizeAnalyzerPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a measurement on screen", async () => {
    const { container, user } = renderFeature(<TransactionSizeAnalyzerPanel />);

    await user.click(screen.getByLabelText(copy.envelopeLabel));
    await user.paste(feeBumpXdr);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.innerTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations while over budget", async () => {
    const { container, user } = renderFeature(<TransactionSizeAnalyzerPanel />);

    await user.click(screen.getByLabelText(copy.envelopeLabel));
    await user.paste(singleOperationXdr);
    await user.click(screen.getByLabelText(copy.budgetLabel));
    await user.paste(String(measuredBytes - 10));
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.budgetOverTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations while showing an error", async () => {
    const { container, user } = renderFeature(<TransactionSizeAnalyzerPanel />);

    await user.click(screen.getByLabelText(copy.envelopeLabel));
    await user.paste(notBase64);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("alert");

    await expectNoAxeViolations(container);
  });
});
