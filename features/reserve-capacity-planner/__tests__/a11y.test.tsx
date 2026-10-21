import { describe, expect, it } from "vitest";
import type { UserEvent } from "@testing-library/user-event";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { ReserveCapacityPlannerPanel } from "@/features/reserve-capacity-planner/components/ReserveCapacityPlannerPanel";
import { copy } from "@/features/reserve-capacity-planner/copy";
import { handlers } from "@/features/reserve-capacity-planner/msw/handlers";
import { COUNT_FIELDS, type CountField } from "@/features/reserve-capacity-planner/types";

withMswHandlers(...handlers);

async function fill(user: UserEvent, counts: Record<CountField, string>, startingBalance: string) {
  for (const field of COUNT_FIELDS) {
    const input = screen.getByLabelText(copy.counts[field].label);
    await user.click(input);
    await user.paste(counts[field]);
  }
  const starting = screen.getByLabelText(copy.startingBalanceLabel);
  await user.click(starting);
  await user.paste(startingBalance);
}

describe("ReserveCapacityPlannerPanel accessibility", () => {
  it("has no WCAG A/AA violations in the idle state", async () => {
    const { container } = renderFeature(<ReserveCapacityPlannerPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a projected reserve", async () => {
    const { container, user } = renderFeature(<ReserveCapacityPlannerPanel />);
    await fill(user, { trustlines: "1", offers: "2", dataEntries: "3", signers: "4" }, "10");
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("heading", { name: copy.resultTitle })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});
