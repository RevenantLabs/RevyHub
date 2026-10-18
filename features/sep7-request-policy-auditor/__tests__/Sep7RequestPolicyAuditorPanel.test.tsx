import { expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { Sep7RequestPolicyAuditorPanel } from "../components/Sep7RequestPolicyAuditorPanel";
import { copy } from "../copy";
import { sample } from "../fixtures/sep7RequestPolicyAuditor.fixture";
import { handlers } from "../msw/handlers";

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

it("shows a passing verdict and clears it", async () => {
  const { user } = renderFeature(<Sep7RequestPolicyAuditorPanel />);
  expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  await fill(user);
  await user.click(screen.getByRole("button", { name: copy.submit }));
  expect(await screen.findByText(copy.resultTitle)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: copy.reset }));
  expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
});

it("shows one alert for a transaction operation", async () => {
  const { user } = renderFeature(<Sep7RequestPolicyAuditorPanel />);
  await user.click(screen.getByLabelText(copy.fields.uri.label));
  await user.paste("web+stellar:tx?xdr=AAAA");
  await user.click(screen.getByLabelText(copy.fields.policy.label));
  await user.paste(sample.policy);
  await user.click(screen.getByRole("button", { name: copy.submit }));
  expect(await screen.findByRole("alert")).toHaveTextContent(copy.fields.uri.label ? "pay" : "");
});
