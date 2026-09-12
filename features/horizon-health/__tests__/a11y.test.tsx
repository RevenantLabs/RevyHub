import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { HorizonHealthPanel } from "@/features/horizon-health/components/HorizonHealthPanel";
import { copy, errorCopy } from "@/features/horizon-health/copy";
import { degradedHandler, handlers } from "@/features/horizon-health/msw/handlers";

const server = withMswHandlers(...handlers);

describe("HorizonHealthPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<HorizonHealthPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations in healthy diagnostic state", async () => {
    const { container, user } = renderFeature(<HorizonHealthPanel />, { network: "testnet" });

    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.healthyTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations in degraded diagnostic state", async () => {
    server.use(degradedHandler);
    const { container, user } = renderFeature(<HorizonHealthPanel />, { network: "testnet" });

    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(errorCopy.degraded.title);

    await expectNoAxeViolations(container);
  });
});
