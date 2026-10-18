import { expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { ContractCallArgumentCheckerPanel } from "../components/ContractCallArgumentCheckerPanel";
import { copy } from "../copy";
import { sample } from "../fixtures/contractCallArgumentChecker.fixture";
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

it("shows a match and clears it", async () => {
  const { user } = renderFeature(<ContractCallArgumentCheckerPanel />);
  expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  await fill(user);
  await user.click(screen.getByRole("button", { name: copy.submit }));
  expect(await screen.findByText(copy.resultTitle)).toBeInTheDocument();
  expect(screen.getByText(copy.noMismatches)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: copy.reset }));
  expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
});

it("shows one alert when the function name is missing", async () => {
  const { user } = renderFeature(<ContractCallArgumentCheckerPanel />);
  await user.click(screen.getByRole("button", { name: copy.submit }));
  expect(await screen.findByRole("alert")).toBeInTheDocument();
});
