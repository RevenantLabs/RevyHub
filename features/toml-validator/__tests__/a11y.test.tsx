import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { TomlValidatorPanel } from "@/features/toml-validator/components/TomlValidatorPanel";

describe("TomlValidatorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<TomlValidatorPanel />);
    await expectNoAxeViolations(container);
  });
});
