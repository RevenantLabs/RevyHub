import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { SponsorshipPlannerPanel } from "@/features/sponsorship-planner/components/SponsorshipPlannerPanel";
import { copy, errorCopy } from "@/features/sponsorship-planner/copy";
import { handlers } from "@/features/sponsorship-planner/msw/handlers";
import {
  existingSponsorId,
  newSponsoredAccountId,
  secretSeed,
  sponsoredAccountId,
  sponsorAccountId,
  unknownSponsorAccountId
} from "@/features/sponsorship-planner/fixtures/sponsorshipPlanner.fixture";

withMswHandlers(...handlers);

describe("SponsorshipPlannerPanel", () => {
  it("renders the pre-interaction empty state", () => {
    renderFeature(<SponsorshipPlannerPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("plans an existing sponsored account and shows itemised subentries", async () => {
    const { user } = renderFeature(<SponsorshipPlannerPanel />);

    await user.type(screen.getByLabelText(copy.sponsorLabel), sponsorAccountId);
    await user.type(screen.getByLabelText(copy.sponsoredLabel), sponsoredAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.resultTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.plannedSubentriesTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.sandwichTitle)).toBeInTheDocument();
    expect(screen.getByText("2.5 XLM (5 reserve units)")).toBeInTheDocument();
    expect(screen.getByText("5.5 XLM")).toBeInTheDocument();
    expect(screen.getAllByText("0 XLM").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("table")).toHaveLength(2);
    expect(screen.getByRole("rowheader", { name: "812345" })).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "kyc-status" })).toBeInTheDocument();
    expect(screen.getByText(copy.operationNames.change_trust)).toBeInTheDocument();
    expect(screen.getByText(copy.operationNames.manage_sell_offer)).toBeInTheDocument();
  });

  it("shows the already-sponsored entries with their existing sponsor", async () => {
    const { user } = renderFeature(<SponsorshipPlannerPanel />);

    await user.type(screen.getByLabelText(copy.sponsorLabel), sponsorAccountId);
    await user.type(screen.getByLabelText(copy.sponsoredLabel), sponsoredAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByRole("heading", { name: copy.alreadySponsoredTitle })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Copy sponsor for /i }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(existingSponsorId.slice(0, 4), { exact: false }).length).toBeGreaterThan(0);
  });

  it("plans only the account entry for a brand-new sponsored account", async () => {
    const { user } = renderFeature(<SponsorshipPlannerPanel />);

    await user.type(screen.getByLabelText(copy.sponsorLabel), sponsorAccountId);
    await user.type(screen.getByLabelText(copy.sponsoredLabel), newSponsoredAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.newAccountNote)).toBeInTheDocument();
    expect(screen.getByText("1 XLM (2 reserve units)")).toBeInTheDocument();
    expect(screen.getAllByRole("table")).toHaveLength(1);
  });

  it("validates the sponsor before making a request", async () => {
    const { user } = renderFeature(<SponsorshipPlannerPanel />);

    await user.type(screen.getByLabelText(copy.sponsorLabel), "GNOPE");
    await user.type(screen.getByLabelText(copy.sponsoredLabel), sponsoredAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByRole("alert")).toHaveTextContent(errorCopy.invalid_sponsor.title);
  });

  it("reports the same account in a banner without a field highlight", async () => {
    const { user } = renderFeature(<SponsorshipPlannerPanel />);

    await user.type(screen.getByLabelText(copy.sponsorLabel), sponsorAccountId);
    await user.type(screen.getByLabelText(copy.sponsoredLabel), sponsorAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(errorCopy.same_account.title);
  });

  it("does not echo a submitted secret seed into result or hook output", async () => {
    const { user, container } = renderFeature(<SponsorshipPlannerPanel />);

    await user.type(screen.getByLabelText(copy.sponsorLabel), sponsorAccountId);
    await user.type(screen.getByLabelText(copy.sponsoredLabel), secretSeed);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByRole("alert")).toHaveTextContent(errorCopy.invalid_sponsored.title);
    expect(container.textContent ?? "").not.toContain(secretSeed);
  });

  it("explains a missing sponsor", async () => {
    const { user } = renderFeature(<SponsorshipPlannerPanel />);

    await user.type(screen.getByLabelText(copy.sponsorLabel), unknownSponsorAccountId);
    await user.type(screen.getByLabelText(copy.sponsoredLabel), sponsoredAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.sponsor_not_found.title)).toBeInTheDocument();
  });
});
