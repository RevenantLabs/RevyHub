import { it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { ContractCallArgumentCheckerPanel } from "../components/ContractCallArgumentCheckerPanel";
import { copy } from "../copy";
import { handlers } from "../msw/handlers";
import { sample } from "../fixtures/contractCallArgumentChecker.fixture";

withMswHandlers(...handlers);

async function fill(user: ReturnType<typeof renderFeature>["user"]) {
  for (const [key, value] of Object.entries(sample)) {
    const spec = copy.fields[key as keyof typeof copy.fields];
    const control = screen.getByLabelText(spec.label);
    await user.clear(control);
    if (value) {
      await user.click(control);
      await user.paste(value);
    }
  }
}

it("passes axe initially", async () => {
  const { container } = renderFeature(<ContractCallArgumentCheckerPanel />);
  await expectNoAxeViolations(container);
});

it("passes axe with a result", async () => {
  const { container, user } = renderFeature(<ContractCallArgumentCheckerPanel />);
  await fill(user);
  await user.click(screen.getByRole("button", { name: copy.submit }));
  await screen.findByText(copy.resultTitle);
  await expectNoAxeViolations(container);
});
