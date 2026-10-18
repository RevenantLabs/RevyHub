import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { AmountConverterPanel } from "@/features/amount-converter/components/AmountConverterPanel";

describe("AmountConverterPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<AmountConverterPanel />);
    await expectNoAxeViolations(container);
  });
});
