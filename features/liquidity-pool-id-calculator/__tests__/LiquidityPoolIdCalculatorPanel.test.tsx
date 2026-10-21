import { expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { LiquidityPoolIdCalculatorPanel } from "../components/LiquidityPoolIdCalculatorPanel";
import { copy } from "../copy";
import { sample } from "../fixtures/liquidityPoolIdCalculator.fixture";

it("shows the empty state before any input", () => {
  renderFeature(<LiquidityPoolIdCalculatorPanel />);
  expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
});

it("computes a pool ID from the default fee and fixture assets", async () => {
  const { user } = renderFeature(<LiquidityPoolIdCalculatorPanel />);
  await user.click(screen.getByLabelText(copy.fields.assetXCode.label));
  await user.paste(sample.assetXCode);
  await user.click(screen.getByLabelText(copy.fields.assetXIssuer.label));
  await user.paste(sample.assetXIssuer);
  await user.click(screen.getByRole("button", { name: copy.submit }));
  expect(await screen.findByText(copy.resultTitle)).toBeInTheDocument();
});

it("shows identical_assets error when both assets are the native asset", async () => {
  const { user } = renderFeature(<LiquidityPoolIdCalculatorPanel />);
  await user.click(screen.getByRole("button", { name: copy.submit }));
  expect(await screen.findByRole("alert")).toBeInTheDocument();
});
