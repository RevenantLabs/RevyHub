import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { PaymentCsvPreflightPanel } from "@/features/payment-csv-preflight/components/PaymentCsvPreflightPanel";
import { copy } from "@/features/payment-csv-preflight/copy";
import {
  invalidRowsCsv,
  validCsv
} from "@/features/payment-csv-preflight/fixtures/paymentCsvPreflight.fixture";

async function submit(user: ReturnType<typeof renderFeature>["user"], csv: string) {
  await user.click(screen.getByLabelText(copy.formLabel));
  await user.paste(csv);
  await user.click(screen.getByRole("button", { name: copy.submit }));
  await screen.findByText(copy.summaryTitle);
}

describe("PaymentCsvPreflightPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<PaymentCsvPreflightPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations once a report is shown", async () => {
    const { container, user } = renderFeature(<PaymentCsvPreflightPanel />);

    await submit(user, validCsv);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations when rows failed and export is blocked", async () => {
    const { container, user } = renderFeature(<PaymentCsvPreflightPanel />);

    await submit(user, invalidRowsCsv);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations in the error state", async () => {
    const { container, user } = renderFeature(<PaymentCsvPreflightPanel />);

    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("alert");

    await expectNoAxeViolations(container);
  });
});
