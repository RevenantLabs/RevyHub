import { it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { ClawbackEligibilityCheckerPanel } from "../components/ClawbackEligibilityCheckerPanel";
import { copy } from "../copy";
import { handlers } from "../msw/handlers";
import { sample } from "../fixtures/clawbackEligibilityChecker.fixture";

withMswHandlers(...handlers);

it("passes axe in the initial, pre-interaction state", async () => {
  const { container } = renderFeature(<ClawbackEligibilityCheckerPanel />);
  await expectNoAxeViolations(container);
});

it("passes axe once a report is shown", async () => {
  const { container, user } = renderFeature(<ClawbackEligibilityCheckerPanel />);
  await user.click(screen.getByLabelText(copy.fields.issuerAccountId.label));
  await user.paste(sample.issuerAccountId);
  await user.click(screen.getByLabelText(copy.fields.holderAccountId.label));
  await user.paste(sample.holderAccountId);
  await user.click(screen.getByLabelText(copy.fields.assetCode.label));
  await user.paste(sample.assetCode);
  await user.click(screen.getByRole("button", { name: copy.submit }));
  await screen.findByText(copy.resultTitle);
  await expectNoAxeViolations(container);
});
