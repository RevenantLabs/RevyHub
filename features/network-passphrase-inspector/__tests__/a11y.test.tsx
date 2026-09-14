import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { NetworkPassphraseInspectorPanel } from "@/features/network-passphrase-inspector/components/NetworkPassphraseInspectorPanel";

describe("NetworkPassphraseInspectorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<NetworkPassphraseInspectorPanel />);
    await expectNoAxeViolations(container);
  });
});
