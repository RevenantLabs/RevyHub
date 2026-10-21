import { describe, expect, it } from "vitest";
import type { UserEvent } from "@testing-library/user-event";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { ReserveCapacityPlannerPanel } from "@/features/reserve-capacity-planner/components/ReserveCapacityPlannerPanel";
import { copy, errorCopy } from "@/features/reserve-capacity-planner/copy";
import { handlers } from "@/features/reserve-capacity-planner/msw/handlers";
import { COUNT_FIELDS, type CountField } from "@/features/reserve-capacity-planner/types";

withMswHandlers(...handlers);

async function setField(user: UserEvent, label: string, value: string) {
  const input = screen.getByLabelText(label);
  await user.clear(input);
  if (value) await user.click(input);
  if (value) await user.paste(value);
}

async function fillCounts(user: UserEvent, counts: Record<CountField, string>) {
  for (const field of COUNT_FIELDS) {
    await setField(user, copy.counts[field].label, counts[field]);
  }
}

describe("ReserveCapacityPlannerPanel", () => {
  it("renders the empty state before any projection", () => {
    renderFeature(<ReserveCapacityPlannerPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows the trustlines message when that count is empty", async () => {
    const { user } = renderFeature(<ReserveCapacityPlannerPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toHaveTextContent(copy.counts.trustlines.invalid);
    expect(screen.queryByText(copy.resultTitle)).not.toBeInTheDocument();
  });

  it("shows a different message for a bad offers count", async () => {
    const { user } = renderFeature(<ReserveCapacityPlannerPanel />);
    await fillCounts(user, { trustlines: "1", offers: "-2", dataEntries: "0", signers: "0" });
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toHaveTextContent(copy.counts.offers.invalid);
  });

  it("projects the hand-computed minimum and spendable balance", async () => {
    const { user } = renderFeature(<ReserveCapacityPlannerPanel />);
    await fillCounts(user, { trustlines: "1", offers: "2", dataEntries: "3", signers: "4" });
    await setField(user, copy.startingBalanceLabel, "10");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByRole("heading", { name: copy.resultTitle })).toBeInTheDocument();
    expect(screen.getByText(copy.minimumBalanceLabel).parentElement).toHaveTextContent("6 XLM");
    expect(screen.getByText(copy.spendableLabel).parentElement).toHaveTextContent("4 XLM");
    expect(screen.getByText(/5,000,000 stroops × \(2 \+ 10\) = 60,000,000 stroops/)).toBeInTheDocument();
    expect(screen.getByText(copy.defaultBaseReserveNote)).toBeInTheDocument();
  });

  it("applies a custom base reserve and says the value is a scenario", async () => {
    const { user } = renderFeature(<ReserveCapacityPlannerPanel />);
    await fillCounts(user, { trustlines: "0", offers: "0", dataEntries: "0", signers: "0" });
    await setField(user, copy.baseReserveLabel, "1.25");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByRole("heading", { name: copy.resultTitle })).toBeInTheDocument();
    expect(screen.getByText(copy.minimumBalanceLabel).parentElement).toHaveTextContent("2.5 XLM");
    expect(screen.getByText(copy.customBaseReserveNote)).toBeInTheDocument();
    expect(screen.getByText(copy.spendableLabel).parentElement).toHaveTextContent(copy.notProvided);
  });

  it("says when the starting balance is below the minimum", async () => {
    const { user } = renderFeature(<ReserveCapacityPlannerPanel />);
    await fillCounts(user, { trustlines: "0", offers: "0", dataEntries: "0", signers: "0" });
    await setField(user, copy.startingBalanceLabel, "0.5");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByRole("status")).toHaveTextContent(copy.belowMinimumTitle);
    expect(screen.getByRole("status")).toHaveTextContent("0 XLM");
    expect(screen.getByText(copy.spendableLabel).parentElement).toHaveTextContent("0 XLM");
  });

  it("rejects a negative starting balance on that field", async () => {
    const { user } = renderFeature(<ReserveCapacityPlannerPanel />);
    await fillCounts(user, { trustlines: "0", offers: "0", dataEntries: "0", signers: "0" });
    await setField(user, copy.startingBalanceLabel, "-1");
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toHaveTextContent(errorCopy.negative_starting_balance.description);
  });

  it("clears a pasted secret key instead of rendering it", async () => {
    const secret = "S_DO_NOT_RENDER_THIS_SEED";
    const { user, container } = renderFeature(<ReserveCapacityPlannerPanel />);
    await setField(user, copy.counts.trustlines.label, secret);
    expect(screen.getByLabelText(copy.counts.trustlines.label)).toHaveValue("");
    expect(screen.getByRole("alert")).toHaveTextContent(errorCopy.secret_rejected.description);
    expect(container.textContent ?? "").not.toContain(secret);
  });

  it("returns to the empty state on reset", async () => {
    const { user } = renderFeature(<ReserveCapacityPlannerPanel />);
    await fillCounts(user, { trustlines: "0", offers: "0", dataEntries: "0", signers: "0" });
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("heading", { name: copy.resultTitle })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: copy.reset }));
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.counts.trustlines.label)).toHaveValue("");
  });
});
