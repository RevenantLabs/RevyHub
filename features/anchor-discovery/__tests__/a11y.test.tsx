import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { AnchorDiscoveryPanel } from "@/features/anchor-discovery/components/AnchorDiscoveryPanel";

describe("AnchorDiscoveryPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<AnchorDiscoveryPanel />);
    await expectNoAxeViolations(container);
  });
});
