import { it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { LiquidityPoolIdCalculatorPanel } from "../components/LiquidityPoolIdCalculatorPanel";
import { copy } from "../copy";
import { sample } from "../fixtures/liquidityPoolIdCalculator.fixture";

it("passes axe in the initial state", async () => {
  const { container } = renderFeature(<LiquidityPoolIdCalculatorPanel />);
  await expectNoAxeViolations(container);
});

it("passes axe once a result is shown", async () => {
  const { container, user } = renderFeature(<LiquidityPoolIdCalculatorPanel />);
  await user.click(screen.getByLabelText(copy.fields.assetXCode.label));
  await user.paste(sample.assetXCode);
  await user.click(screen.getByLabelText(copy.fields.assetXIssuer.label));
  await user.paste(sample.assetXIssuer);
  await user.click(screen.getByRole("button", { name: copy.submit }));
  await screen.findByText(copy.resultTitle);
  await expectNoAxeViolations(container);
});
