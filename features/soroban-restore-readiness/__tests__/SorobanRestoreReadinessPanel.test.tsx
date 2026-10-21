import { expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { SorobanRestoreReadinessPanel } from "../components/SorobanRestoreReadinessPanel";
import { copy } from "../copy";
import { handlers } from "../msw/handlers";
import { sample } from "../fixtures/sorobanRestoreReadiness.fixture";

withMswHandlers(...handlers);

async function fill(user: ReturnType<typeof import("@testing-library/user-event").default.setup>, values: typeof sample) {
  await user.click(screen.getByLabelText(copy.fields.contractId.label));
  await user.paste(values.contractId);
  await user.click(screen.getByLabelText(copy.fields.storageKeyXdr.label));
  await user.paste(values.storageKeyXdr);
}

it("shows the empty state before any input", () => {
  renderFeature(<SorobanRestoreReadinessPanel />);
  expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
});

it("checks readiness for a live entry and resets", async () => {
  const { user } = renderFeature(<SorobanRestoreReadinessPanel />);
  await fill(user, sample);
  await user.click(screen.getByRole("button", { name: copy.submit }));
  expect(await screen.findByText("Live")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: copy.reset }));
  expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
});

it("rejects a pasted secret key and never submits it", async () => {
  const { user } = renderFeature(<SorobanRestoreReadinessPanel />);
  const input = screen.getByLabelText(copy.fields.contractId.label);
  await user.click(input);
  await user.paste("SDNOGXWVLKTJAVFGMPYEMU3CD5RKFXZEFD5ZVM7SMKGRTZBAFUY5PWWL");
  expect(screen.getByRole("alert")).toHaveTextContent(copy.rejected);
  expect(input).toHaveValue("");
});
