import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { copy } from "@/features/horizon-rate-limit-monitor/copy";
import { handlers } from "@/features/horizon-rate-limit-monitor/msw/handlers";
import { HorizonRateLimitMonitorPanel } from "@/features/horizon-rate-limit-monitor/components/HorizonRateLimitMonitorPanel";
withMswHandlers(...handlers);
describe("monitor accessibility", () => {
  it("meets WCAG 2.1 A/AA in idle state", async () => {
    const { container } = renderFeature(<HorizonRateLimitMonitorPanel />);
    await expectNoAxeViolations(container);
  });
  it("meets WCAG 2.1 A/AA when results are shown", async () => {
    const { container, user } = renderFeature(<HorizonRateLimitMonitorPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("table", { name: copy.resultTitle });
    await expectNoAxeViolations(container);
  });
});
