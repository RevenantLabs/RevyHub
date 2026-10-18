import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { EffectsTimelinePanel } from "@/features/effects-timeline/components/EffectsTimelinePanel";
import { copy, errorCopy } from "@/features/effects-timeline/copy";
import { handlers } from "@/features/effects-timeline/msw/handlers";
import {
  accountId,
  unknownAccountId
} from "@/features/effects-timeline/fixtures/effectsTimeline.fixture";

withMswHandlers(...handlers);

describe("EffectsTimelinePanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<EffectsTimelinePanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a grouped timeline and its pager", async () => {
    const { container, user } = renderFeature(<EffectsTimelinePanel />);

    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("list", { name: copy.timelineLabel });

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations on a continued page", async () => {
    const { container, user } = renderFeature(<EffectsTimelinePanel />);

    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("list", { name: copy.timelineLabel });

    // The older page carries the boundary notice and a disabled pager button,
    // neither of which appears on page one.
    await user.click(screen.getByRole("button", { name: copy.olderPage }));
    await screen.findByText(copy.continuedFromNewerPage);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations while reporting an error", async () => {
    const { container, user } = renderFeature(<EffectsTimelinePanel />);

    await user.type(screen.getByLabelText(copy.formLabel), unknownAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(errorCopy.account_not_found.title);

    await expectNoAxeViolations(container);
  });
});
