import { expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { ClawbackEligibilityCheckerPanel } from "../components/ClawbackEligibilityCheckerPanel";
import { copy } from "../copy";
import { handlers } from "../msw/handlers";
import { sample } from "../fixtures/clawbackEligibilityChecker.fixture";

withMswHandlers(...handlers);

async function fill(user: ReturnType<typeof import("@testing-library/user-event").default.setup>, values: typeof sample) {
  await user.click(screen.getByLabelText(copy.fields.issuerAccountId.label));
  await user.paste(values.issuerAccountId);
  await user.click(screen.getByLabelText(copy.fields.holderAccountId.label));
  await user.paste(values.holderAccountId);
  await user.click(screen.getByLabelText(copy.fields.assetCode.label));
  await user.paste(values.assetCode);
}

it("shows the empty state before any input", () => {
  renderFeature(<ClawbackEligibilityCheckerPanel />);
  expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
});

it("checks eligibility and resets", async () => {
  const { user } = renderFeature(<ClawbackEligibilityCheckerPanel />);
  await fill(user, sample);
  await user.click(screen.getByRole("button", { name: copy.submit }));
  expect(await screen.findByText(copy.resultTitle)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: copy.reset }));
  expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
});

it("rejects a pasted secret key and never submits it", async () => {
  const { user } = renderFeature(<ClawbackEligibilityCheckerPanel />);
  const input = screen.getByLabelText(copy.fields.issuerAccountId.label);
  await user.click(input);
  await user.paste("SDNOGXWVLKTJAVFGMPYEMU3CD5RKFXZEFD5ZVM7SMKGRTZBAFUY5PWWL");
  expect(screen.getByRole("alert")).toHaveTextContent(copy.rejected);
  expect(input).toHaveValue("");
});
