import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { Sep12KycReferencePanel } from "@/features/sep12-kyc-reference/components/Sep12KycReferencePanel";

describe("Sep12KycReferencePanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<Sep12KycReferencePanel />);
    await expectNoAxeViolations(container);
  });
});
