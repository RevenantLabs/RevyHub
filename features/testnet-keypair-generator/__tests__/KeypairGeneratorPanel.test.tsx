import { describe, it, expect } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { KeypairGeneratorPanel } from "@/features/testnet-keypair-generator/components/KeypairGeneratorPanel";
import { copy } from "@/features/testnet-keypair-generator/copy";

describe("KeypairGeneratorPanel", () => {
  it("renders form with empty state", () => {
    renderFeature(<KeypairGeneratorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeTruthy();
  });

  it("has generate button", () => {
    renderFeature(<KeypairGeneratorPanel />);
    expect(screen.getByText("Generate New")).toBeTruthy();
  });
});
