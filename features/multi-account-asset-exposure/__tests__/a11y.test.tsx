import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { MultiAccountAssetExposurePanel } from "../components/MultiAccountAssetExposurePanel";
import { accountA, accountB } from "../fixtures/multiAccountAssetExposure.fixture";
import { copy } from "../copy";
import { handlers } from "../msw/handlers";
withMswHandlers(...handlers);
describe("exposure panel accessibility", () => {
  it("has no WCAG 2.1 A/AA violations in idle state", async () => {
    const { container } = renderFeature(<MultiAccountAssetExposurePanel />);
    await expectNoAxeViolations(container);
  });
  it("has no WCAG 2.1 A/AA violations with a matrix", async () => {
    const { container, user } = renderFeature(<MultiAccountAssetExposurePanel />);
    await user.type(screen.getByLabelText(copy.formLabel), `${accountA}\n${accountB}`);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("table");
    await expectNoAxeViolations(container);
  });
});
