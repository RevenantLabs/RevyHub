import { describe, it, expect } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { NetworkPassphraseInspectorPanel } from "@/features/network-passphrase-inspector/components/NetworkPassphraseInspectorPanel";
import { copy } from "@/features/network-passphrase-inspector/copy";

describe("NetworkPassphraseInspectorPanel", () => {
  it("renders form with empty state", () => {
    renderFeature(<NetworkPassphraseInspectorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeTruthy();
  });

  it("has accessible form fields", () => {
    renderFeature(<NetworkPassphraseInspectorPanel />);
    expect(screen.getByLabelText(copy.formLabel)).toBeTruthy();
  });
});
