import { it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { ContractDeployPreviewPanel } from "../components/ContractDeployPreviewPanel";
import { copy } from "../copy";
import { sample } from "../fixtures/contractDeployPreview.fixture";

it("passes axe in the initial state", async () => {
  const { container } = renderFeature(<ContractDeployPreviewPanel />);
  await expectNoAxeViolations(container);
});

it("passes axe once a result is shown", async () => {
  const { container, user } = renderFeature(<ContractDeployPreviewPanel />);
  await user.click(screen.getByLabelText(copy.fieldLabel));
  await user.paste(sample.envelope);
  await user.click(screen.getByRole("button", { name: copy.submit }));
  await screen.findByText(copy.resultTitle);
  await expectNoAxeViolations(container);
});
