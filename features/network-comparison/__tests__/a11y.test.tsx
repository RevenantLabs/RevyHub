import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { NetworkComparisonPanel } from "@/features/network-comparison/components/NetworkComparisonPanel";
import { copy, errorCopy } from "@/features/network-comparison/copy";
import { handlers, testnetErrorHandler } from "@/features/network-comparison/msw/handlers";

const server = withMswHandlers(...handlers);

describe("NetworkComparisonPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial empty state", async () => {
    const { container } = renderFeature(<NetworkComparisonPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with comparison results rendered", async () => {
    resetHorizonClients();
    const { container, user } = renderFeature(<NetworkComparisonPanel />);

    const button = screen.getAllByRole("button", { name: copy.submit })[0];
    await user.click(button);
    await screen.findByText(copy.protocolDifferenceBadge);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations in partial failure state", async () => {
    server.use(testnetErrorHandler);
    resetHorizonClients();
    const { container, user } = renderFeature(<NetworkComparisonPanel />);

    const button = screen.getAllByRole("button", { name: copy.submit })[0];
    await user.click(button);
    await screen.findByText(errorCopy.partial_failure.title);

    await expectNoAxeViolations(container);
  });
});
