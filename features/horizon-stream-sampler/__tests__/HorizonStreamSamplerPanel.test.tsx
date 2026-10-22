import { describe, expect, it } from "vitest"; import { renderFeature, screen } from "@/core/testing/render"; import { HorizonStreamSamplerPanel } from "@/features/horizon-stream-sampler/components/HorizonStreamSamplerPanel"; import { copy } from "@/features/horizon-stream-sampler/copy";
describe("HorizonStreamSamplerPanel", () => {
  it("renders the empty state", () => { renderFeature(<HorizonStreamSamplerPanel />); expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument(); });
  it("renders both bounded controls", () => { renderFeature(<HorizonStreamSamplerPanel />); expect(screen.getByLabelText(copy.sampleSizeLabel)).toBeInTheDocument(); expect(screen.getByLabelText(copy.durationLabel)).toBeInTheDocument(); });
});
