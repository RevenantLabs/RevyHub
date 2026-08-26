import { describe, expect, it } from "vitest";
import { resetHorizonClients } from "@/core/horizon/client";
import { renderFeature, screen, waitFor, within } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { ReserveCalculatorPanel } from "@/features/reserve-calculator/components/ReserveCalculatorPanel";
import { copy, errorCopy } from "@/features/reserve-calculator/copy";
import { handlers } from "@/features/reserve-calculator/msw/handlers";
import {
  accountId,
  underfundedAccountId,
  unknownAccountId
} from "@/features/reserve-calculator/fixtures/reserveCalculator.fixture";

withMswHandlers(...handlers);

describe("ReserveCalculatorPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<ReserveCalculatorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<ReserveCalculatorPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(errorCopy.empty_input.title)).toBeInTheDocument();
  });

  it("renders the reserve, spendable balance, breakdown, and source ledger", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<ReserveCalculatorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    const summary = await screen.findByRole("heading", { name: copy.resultTitle });
    const card = summary.closest("div.rounded-lg");

    expect(card).not.toBeNull();
    expect(within(card as HTMLElement).getByText("7.75 XLM")).toBeInTheDocument();
    expect(within(card as HTMLElement).getByText("3 XLM")).toBeInTheDocument();
    expect(within(card as HTMLElement).getAllByText("0.5 XLM").length).toBeGreaterThan(0);
    expect(within(card as HTMLElement).getByText("1,234,567")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: copy.breakdownTitle })).toBeInTheDocument();
    expect(screen.getByText(copy.sponsoringLabel(2))).toBeInTheDocument();
    expect(screen.getByText(copy.sponsoredLabel(1))).toBeInTheDocument();
  });

  it("calls out an underfunded account and renders zero spendable", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<ReserveCalculatorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), underfundedAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.belowMinimumTitle)).toBeInTheDocument();
    expect(screen.getAllByText("0 XLM").length).toBeGreaterThan(0);
  });

  it("explains a missing account", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<ReserveCalculatorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), unknownAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.account_not_found.title)).toBeInTheDocument();
  });

  it("rejects a secret key without rendering it in output or requesting data", async () => {
    const secret = "S".repeat(56);
    const { container, user } = renderFeature(<ReserveCalculatorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), secret);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    await waitFor(() =>
      expect(screen.getByText(errorCopy.invalid_address.title)).toBeInTheDocument()
    );
    expect(container.textContent ?? "").not.toContain(secret);
  });
});
