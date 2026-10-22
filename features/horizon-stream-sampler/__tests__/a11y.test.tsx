import { describe, it } from "vitest";
import { renderFeature } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { HorizonStreamSamplerPanel } from "@/features/horizon-stream-sampler/components/HorizonStreamSamplerPanel";
import { HorizonStreamSamplerResult } from "@/features/horizon-stream-sampler/components/HorizonStreamSamplerResult";
import { horizonStreamSamplerFixture } from "@/features/horizon-stream-sampler/fixtures/horizonStreamSampler.fixture";

describe("HorizonStreamSamplerPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<HorizonStreamSamplerPanel />);
    await expectNoAxeViolations(container);
  });
  it("has no WCAG A/AA violations with a completed sample", async () => {
    const { container } = renderFeature(<HorizonStreamSamplerResult result={horizonStreamSamplerFixture} />);
    await expectNoAxeViolations(container);
  });
});
