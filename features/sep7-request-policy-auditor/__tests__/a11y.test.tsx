import { it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { Sep7RequestPolicyAuditorPanel } from "../components/Sep7RequestPolicyAuditorPanel";
import { copy } from "../copy";
import { handlers } from "../msw/handlers";
import { sample } from "../fixtures/sep7RequestPolicyAuditor.fixture";

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
  const { container } = renderFeature(<Sep7RequestPolicyAuditorPanel />);
  await expectNoAxeViolations(container);
});

it("passes axe with a verdict", async () => {
  const { container, user } = renderFeature(<Sep7RequestPolicyAuditorPanel />);
  await fill(user);
  await user.click(screen.getByRole("button", { name: copy.submit }));
  await screen.findByText(copy.resultTitle);
  await expectNoAxeViolations(container);
});
