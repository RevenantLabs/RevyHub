import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { PreconditionsExplainerPanel } from "@/features/preconditions-explainer/components/PreconditionsExplainerPanel";
import { copy, errorCopy, verdictCopy } from "@/features/preconditions-explainer/copy";
import {
  handlers,
  serverErrorHandler
} from "@/features/preconditions-explainer/msw/handlers";
import {
  openXdr,
  unconditionalXdr
} from "@/features/preconditions-explainer/fixtures/preconditionsExplainer.fixture";

const server = withMswHandlers(...handlers);

async function explain(user: ReturnType<typeof renderFeature>["user"], value: string) {
  await user.click(screen.getByLabelText(copy.formLabel));
  await user.paste(value);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("PreconditionsExplainerPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<PreconditionsExplainerPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations in its result state", async () => {
    const { container, user } = renderFeature(<PreconditionsExplainerPanel />);
    await explain(user, openXdr);
    await screen.findByText(verdictCopy.satisfiable.title);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations in its error state", async () => {
    const { container, user } = renderFeature(<PreconditionsExplainerPanel />);
    await explain(user, unconditionalXdr);
    await screen.findByText(errorCopy.no_preconditions.title);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations in its degraded result state", async () => {
    server.use(serverErrorHandler);
    const { container, user } = renderFeature(<PreconditionsExplainerPanel />);
    await explain(user, openXdr);
    await screen.findByText(copy.degradedTitle);

    await expectNoAxeViolations(container);
  });
});
