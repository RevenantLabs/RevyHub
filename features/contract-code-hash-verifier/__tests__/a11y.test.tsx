import { it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { ContractCodeHashVerifierPanel } from "../components/ContractCodeHashVerifierPanel";
import { copy } from "../copy";
import { handlers } from "../msw/handlers";
import { sample } from "../fixtures/contractCodeHashVerifier.fixture";

withMswHandlers(...handlers);

it("passes axe initially", async () => {
  const { container } = renderFeature(<ContractCodeHashVerifierPanel />);
  await expectNoAxeViolations(container);
});

it("passes axe with a match", async () => {
  const { container, user } = renderFeature(<ContractCodeHashVerifierPanel />);
  const input = screen.getByLabelText(copy.fields.contractId.label);
  await user.click(input);
  await user.paste(sample.contractId);
  await user.click(screen.getByRole("button", { name: copy.submit }));
  await screen.findByText(copy.verdicts.match);
  await expectNoAxeViolations(container);
});
