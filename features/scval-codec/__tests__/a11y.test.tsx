import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { ScvalCodecPanel } from "@/features/scval-codec/components/ScvalCodecPanel";

describe("ScvalCodecPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<ScvalCodecPanel />);
    await expectNoAxeViolations(container);
  });
});
