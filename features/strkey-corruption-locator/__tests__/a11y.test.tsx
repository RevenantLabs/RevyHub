import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { StrkeyCorruptionLocatorPanel } from "@/features/strkey-corruption-locator/components/StrkeyCorruptionLocatorPanel";
import { copy } from "@/features/strkey-corruption-locator/copy";
import { singleCharTypo } from "@/features/strkey-corruption-locator/fixtures/single-char-typo.fixture";

describe("StrkeyCorruptionLocatorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<StrkeyCorruptionLocatorPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations once corrections are shown", async () => {
    const { container, user } = renderFeature(<StrkeyCorruptionLocatorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), singleCharTypo);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.resultTitle);

    await expectNoAxeViolations(container);
  });
});
