import { it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { SorobanRestoreReadinessPanel } from "../components/SorobanRestoreReadinessPanel";
import { copy } from "../copy";
import { handlers } from "../msw/handlers";
import { sample } from "../fixtures/sorobanRestoreReadiness.fixture";

withMswHandlers(...handlers);

it("passes axe in the initial, pre-interaction state", async () => {
  const { container } = renderFeature(<SorobanRestoreReadinessPanel />);
  await expectNoAxeViolations(container);
});

it("passes axe once a result is shown", async () => {
  const { container, user } = renderFeature(<SorobanRestoreReadinessPanel />);
  await user.click(screen.getByLabelText(copy.fields.contractId.label));
  await user.paste(sample.contractId);
  await user.click(screen.getByLabelText(copy.fields.storageKeyXdr.label));
  await user.paste(sample.storageKeyXdr);
  await user.click(screen.getByRole("button", { name: copy.submit }));
  await screen.findByText("Live");
  await expectNoAxeViolations(container);
});
