import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { KeypairGeneratorPanel } from "@/features/testnet-keypair-generator/components/KeypairGeneratorPanel";

describe("KeypairGeneratorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<KeypairGeneratorPanel />);
    await expectNoAxeViolations(container);
  });
});
