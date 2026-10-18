import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { FederationResolverPanel } from "@/features/federation-resolver/components/FederationResolverPanel";
import { copy } from "@/features/federation-resolver/copy";
import { handlers } from "@/features/federation-resolver/msw/handlers";
import { DOMAIN } from "@/features/federation-resolver/fixtures/federationResolver.fixture";

withMswHandlers(...handlers);

describe("FederationResolverPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<FederationResolverPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a resolved address on screen", async () => {
    const { container, user } = renderFeature(<FederationResolverPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), `alice*${DOMAIN}`);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.memoWarningTitle);

    await expectNoAxeViolations(container);
  });
});
