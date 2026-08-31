import { describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { truncateMiddle } from "@/core/lib/strings";
import { withMswHandlers } from "@/core/testing/msw";
import { SponsoredReservesPanel } from "@/features/sponsored-reserves/components/SponsoredReservesPanel";
import { copy, errorCopy } from "@/features/sponsored-reserves/copy";
import { handlers } from "@/features/sponsored-reserves/msw/handlers";
import {
  accountId,
  noRelationshipsAccountId,
  secretSeed,
  sponsorA,
  sponsorB,
  unknownAccountId
} from "@/features/sponsored-reserves/fixtures/sponsoredReserves.fixture";

withMswHandlers(...handlers);

describe("SponsoredReservesPanel", () => {
  it("renders the pre-interaction empty state", () => {
    renderFeature(<SponsoredReservesPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("renders separate counts, the net effect and every sponsored entry", async () => {
    const { user } = renderFeature(<SponsoredReservesPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument());
    expect(screen.getByText(copy.reserveUnits(6))).toBeInTheDocument();
    expect(screen.getByText(copy.reserveUnits(2))).toBeInTheDocument();
    expect(screen.getByText(`+2 ${copy.xlmUnit}`)).toBeInTheDocument();
    expect(screen.getByText(copy.entriesSummaryTitle)).toBeInTheDocument();
    for (const kind of Object.keys(copy.entryKinds) as Array<keyof typeof copy.entryKinds>) {
      expect(screen.getByText(copy.entryCount(copy.entryKinds[kind], 1))).toBeInTheDocument();
    }
    expect(screen.getAllByRole("rowheader")).toHaveLength(5);
    expect(screen.getByRole("rowheader", { name: "#812345" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: copy.entryKinds.account })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: copy.entryKinds.data })).toBeInTheDocument();
  });

  it("uses consistently truncated, copyable sponsor addresses", async () => {
    const { user } = renderFeature(<SponsoredReservesPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument());

    expect(screen.getAllByText(truncateMiddle(sponsorA, 4))).toHaveLength(3);
    expect(screen.getAllByText(truncateMiddle(sponsorB, 4))).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: /^Copy sponsor for /i })).toHaveLength(5);
  });

  it("shows a specific no-relationships state instead of empty tables", async () => {
    const { user } = renderFeature(<SponsoredReservesPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), noRelationshipsAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.noRelationshipsTitle)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByText(copy.entriesSummaryTitle)).not.toBeInTheDocument();
  });

  it("validates an address before sending a request", async () => {
    const { user } = renderFeature(<SponsoredReservesPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), "GNOPE");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.invalid_address.title)).toBeInTheDocument();
  });

  it("does not echo a submitted secret seed into result or hook output", async () => {
    const { user, container } = renderFeature(<SponsoredReservesPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), secretSeed);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.invalid_address.title)).toBeInTheDocument();
    expect(container.textContent ?? "").not.toContain(secretSeed);
  });

  it("explains a missing account", async () => {
    const { user } = renderFeature(<SponsoredReservesPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), unknownAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.account_not_found.title)).toBeInTheDocument();
  });
});
