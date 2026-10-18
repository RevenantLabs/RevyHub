import { expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { SorobanEventFilterComposerPanel } from "../components/SorobanEventFilterComposerPanel";
import { copy } from "../copy";
import { sample } from "../fixtures/sorobanEventFilterComposer.fixture";
import { handlers } from "../msw/handlers";

withMswHandlers(...handlers);

async function fill(user: ReturnType<typeof renderFeature>["user"]) {
  for (const [key, value] of Object.entries(sample)) {
    const spec = copy.fields[key as keyof typeof copy.fields] as { label: string; options?: readonly string[] };
    const control = screen.getByLabelText(spec.label);
    if (spec.options) await user.selectOptions(control, value);
    else {
      await user.clear(control);
      if (value) await user.click(control);
      if (value) await user.paste(value);
    }
  }
}

it("renders events and returns to idle on reset", async () => {
  const { user } = renderFeature(<SorobanEventFilterComposerPanel />);
  expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  await fill(user);
  await user.click(screen.getByRole("button", { name: copy.submit }));
  expect(await screen.findByText(copy.resultTitle)).toBeInTheDocument();
  expect(screen.getByText(copy.previewTitle)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: copy.reset }));
  expect(screen.queryByText(copy.resultTitle)).not.toBeInTheDocument();
});

it("shows one alert for an empty submission", async () => {
  const { user } = renderFeature(<SorobanEventFilterComposerPanel />);
  await user.click(screen.getByRole("button", { name: copy.submit }));
  expect(await screen.findByRole("alert")).toBeInTheDocument();
});
