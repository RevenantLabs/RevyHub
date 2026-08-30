import { describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor, within } from "@/core/testing/render";
import { truncateMiddle } from "@/core/lib/strings";
import { withMswHandlers } from "@/core/testing/msw";
import { EffectsTimelinePanel } from "@/features/effects-timeline/components/EffectsTimelinePanel";
import { copy, errorCopy } from "@/features/effects-timeline/copy";
import { handlers } from "@/features/effects-timeline/msw/handlers";
import {
  accountId,
  counterparty,
  issuer,
  quietAccountId,
  secretSeed,
  unknownAccountId
} from "@/features/effects-timeline/fixtures/effectsTimeline.fixture";

withMswHandlers(...handlers);

async function loadTimeline() {
  const view = renderFeature(<EffectsTimelinePanel />);

  await view.user.type(screen.getByLabelText(copy.formLabel), accountId);
  await view.user.click(screen.getByRole("button", { name: copy.submit }));
  await screen.findByRole("list", { name: copy.timelineLabel });

  return view;
}

/** The newest group on page one: a path payment plus a sponsorship. */
function newestTransaction(): HTMLElement {
  const group = screen
    .getByRole("heading", { level: 2, name: copy.transactionHeading(5_000_010, 3) })
    .closest("li");

  if (!group) throw new Error("the newest transaction group is not on the page");
  return group;
}

describe("EffectsTimelinePanel", () => {
  it("renders the pre-interaction empty state", () => {
    renderFeature(<EffectsTimelinePanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("groups effects by transaction, newest transaction first", async () => {
    await loadTimeline();

    // Twenty effects on the page, eight transactions to account for them.
    expect(screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent))
      .toEqual([
        copy.summaryTitle,
        copy.transactionHeading(5_000_010, 3),
        copy.transactionHeading(5_000_009, 1),
        copy.transactionHeading(5_000_008, 2),
        copy.transactionHeading(5_000_007, 1),
        copy.transactionHeading(5_000_006, 1),
        copy.transactionHeading(5_000_005, 4),
        copy.transactionHeading(5_000_004, 1),
        copy.transactionHeading(5_000_003, 2)
      ]);
  });

  it("orders the effects of a transaction chronologically inside their operation", async () => {
    await loadTimeline();

    // The path payment: one operation whose three effects must read debit,
    // trade, credit — the order the ledger applied them in.
    const [pathPayment] = within(newestTransaction()).getAllByRole("list", {
      name: copy.effectsLabel
    });

    expect(
      within(pathPayment)
        .getAllByRole("listitem")
        .map((item) => item.textContent)
    ).toEqual([
      expect.stringContaining("Account debited"),
      expect.stringContaining(copy.effectTypeLabels.trade),
      expect.stringContaining("Account credited")
    ]);
  });

  it("renders each effect's own fields with consistent amounts and assets", async () => {
    await loadTimeline();

    expect(screen.getByText("1,200 XLM")).toBeInTheDocument();
    expect(screen.getByText(`0.0000001 USDC · ${truncateMiddle(issuer, 4)}`)).toBeInTheDocument();
    expect(screen.getByText("1 / 2 / 3")).toBeInTheDocument();
    expect(screen.getByText("revyhubx.example")).toBeInTheDocument();
    // A sequence number is shown in full rather than shortened like an address.
    expect(screen.getByText("21474836480000000")).toBeInTheDocument();
    expect(screen.getAllByText(truncateMiddle(counterparty, 6)).length).toBeGreaterThan(0);
  });

  it("distinguishes balance changes from configuration changes in words", async () => {
    await loadTimeline();

    expect(screen.getAllByText(copy.categoryLabels.balance)).toHaveLength(9);
    expect(screen.getAllByText(copy.categoryLabels.configuration)).toHaveLength(11);
  });

  it("explains that one operation can produce several effects, with an example", async () => {
    await loadTimeline();

    expect(screen.getByText(copy.multiEffectTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.multiEffectExample(3, 5_000_010, 1))).toBeInTheDocument();

    // The example is not just a claim in the banner: the grouping it points at
    // is on the page, showing three effects under that single operation.
    expect(within(newestTransaction()).getByText(copy.operationMeta(3))).toBeInTheDocument();
  });

  it("pages back and forth and disables each direction at its end", async () => {
    const { user } = await loadTimeline();

    expect(screen.getByRole("button", { name: copy.newerPage })).toBeDisabled();
    expect(screen.getByRole("button", { name: copy.olderPage })).toBeEnabled();
    expect(screen.getByText(copy.continuesOnOlderPage)).toBeInTheDocument();
    expect(screen.getByText(copy.pagePosition(1))).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: copy.olderPage }));

    expect(await screen.findByText(copy.pagePosition(2))).toBeInTheDocument();
    expect(screen.getByText(copy.continuedFromNewerPage)).toBeInTheDocument();
    expect(screen.getByText(copy.atOldestEnd)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: copy.olderPage })).toBeDisabled();
    expect(screen.getByRole("button", { name: copy.newerPage })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: copy.newerPage }));

    expect(await screen.findByText(copy.pagePosition(1))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: copy.newerPage })).toBeDisabled();
  });

  it("explains an account that exists but has no effects", async () => {
    const { user } = renderFeature(<EffectsTimelinePanel />);

    await user.type(screen.getByLabelText(copy.formLabel), quietAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.noEffectsTitle)).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: copy.timelineLabel })).not.toBeInTheDocument();
  });

  it("asks for an address before making a request", async () => {
    const { user } = renderFeature(<EffectsTimelinePanel />);

    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.empty_input.title)).toBeInTheDocument();
  });

  it("validates the address before making a request", async () => {
    const { user } = renderFeature(<EffectsTimelinePanel />);

    await user.type(screen.getByLabelText(copy.formLabel), "GNOPE");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.invalid_address.title)).toBeInTheDocument();
  });

  it("does not echo a submitted secret seed back into the output", async () => {
    const { user, container } = renderFeature(<EffectsTimelinePanel />);

    await user.type(screen.getByLabelText(copy.formLabel), secretSeed);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    // The seed is rejected on its `S` prefix, so it reaches neither a request
    // nor the rendered page: the error names the problem without repeating it.
    expect(await screen.findByText(errorCopy.invalid_address.title)).toBeInTheDocument();
    expect(container.textContent ?? "").not.toContain(secretSeed);
  });

  it("explains a missing account on the selected network", async () => {
    const { user } = renderFeature(<EffectsTimelinePanel />);

    await user.type(screen.getByLabelText(copy.formLabel), unknownAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.account_not_found.title)).toBeInTheDocument();
  });

  it("clears a timeline when the network is switched", async () => {
    await loadTimeline();

    // The panel is remounted under the other network the way the header switch
    // does it; history from one network must not be shown under the other.
    renderFeature(<EffectsTimelinePanel />, { network: "mainnet" });

    await waitFor(() => expect(screen.getAllByText(copy.emptyTitle).length).toBeGreaterThan(0));
  });
});
