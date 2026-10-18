import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { SorobanFootprintDiffPanel } from "@/features/soroban-footprint-diff/components/SorobanFootprintDiffPanel";
import { copy } from "@/features/soroban-footprint-diff/copy";
import {
  firstSimulationJson,
  secondSimulationJson
} from "@/features/soroban-footprint-diff/fixtures/sorobanFootprintDiff.fixture";

describe("SorobanFootprintDiffPanel accessibility", () => {
  it("has no WCAG A/AA violations idle", async () => {
    const { container } = renderFeature(<SorobanFootprintDiffPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations after success", async () => {
    const { container, user } = renderFeature(<SorobanFootprintDiffPanel />);
    await user.click(screen.getByLabelText(copy.firstLabel));
    await user.paste(firstSimulationJson);
    await user.click(screen.getByLabelText(copy.secondLabel));
    await user.paste(secondSimulationJson);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.modeTitle);
    await expectNoAxeViolations(container);
  });
});
