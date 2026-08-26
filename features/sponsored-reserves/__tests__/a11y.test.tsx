import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { SponsoredReservesPanel } from "@/features/sponsored-reserves/components/SponsoredReservesPanel";

describe("SponsoredReservesPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<SponsoredReservesPanel />);
    await expectNoAxeViolations(container);
  });
});
