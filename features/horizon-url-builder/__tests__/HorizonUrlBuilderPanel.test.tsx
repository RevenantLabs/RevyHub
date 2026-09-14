import { describe, it, expect } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { HorizonUrlBuilderPanel } from "@/features/horizon-url-builder/components/HorizonUrlBuilderPanel";
import { copy } from "@/features/horizon-url-builder/copy";

describe("HorizonUrlBuilderPanel", () => {
  it("renders form with empty state", () => {
    renderFeature(<HorizonUrlBuilderPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeTruthy();
  });

  it("has build button", () => {
    renderFeature(<HorizonUrlBuilderPanel />);
    expect(screen.getByText(copy.submit)).toBeTruthy();
  });
});
