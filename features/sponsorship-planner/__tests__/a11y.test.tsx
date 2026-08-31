import { describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { SponsorshipPlannerPanel } from "@/features/sponsorship-planner/components/SponsorshipPlannerPanel";
import { copy } from "@/features/sponsorship-planner/copy";
import { handlers } from "@/features/sponsorship-planner/msw/handlers";
import {
  sponsoredAccountId,
  sponsorAccountId
} from "@/features/sponsorship-planner/fixtures/sponsorshipPlanner.fixture";

withMswHandlers(...handlers);

describe("SponsorshipPlannerPanel accessibility", () => {
  it("has no WCAG 2.1 A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<SponsorshipPlannerPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG 2.1 A/AA violations with a plan shown", async () => {
    const { container, user } = renderFeature(<SponsorshipPlannerPanel />);

    await user.type(screen.getByLabelText(copy.sponsorLabel), sponsorAccountId);
    await user.type(screen.getByLabelText(copy.sponsoredLabel), sponsoredAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    await waitFor(() => expect(screen.getByText(copy.resultTitle)).toBeInTheDocument());
    await expectNoAxeViolations(container);
  });
});
