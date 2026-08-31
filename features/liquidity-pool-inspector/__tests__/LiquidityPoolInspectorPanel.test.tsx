import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { LiquidityPoolInspectorPanel } from "@/features/liquidity-pool-inspector/components/LiquidityPoolInspectorPanel";
import { copy, errorCopy } from "@/features/liquidity-pool-inspector/copy";
import { handlers } from "@/features/liquidity-pool-inspector/msw/handlers";
import {
  missingPoolId,
  poolId
} from "@/features/liquidity-pool-inspector/fixtures/liquidityPoolInspector.fixture";

withMswHandlers(...handlers);

describe("LiquidityPoolInspectorPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<LiquidityPoolInspectorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<LiquidityPoolInspectorPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(errorCopy.empty_input.title)).toBeInTheDocument();
  });

  it("renders reserves, prices and share values for a known pool", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<LiquidityPoolInspectorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), poolId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText("30 bps (0.30%)")).toBeInTheDocument();
    expect(screen.getByText(/1 XLM ≈ 0\.25 USDC:/)).toBeInTheDocument();
    expect(screen.getByText(/1 USDC:.*≈ 4 XLM/)).toBeInTheDocument();
    expect(screen.getByText("10000.0000000")).toBeInTheDocument();
    expect(screen.getByText("2500.0000000")).toBeInTheDocument();
  });

  it("explains that a pool ID is not an account address", async () => {
    const { user } = renderFeature(<LiquidityPoolInspectorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), "GABC");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.invalid_pool_id.title)).toBeInTheDocument();
  });

  it("points at the network switch when a pool is not found", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<LiquidityPoolInspectorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), missingPoolId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.pool_not_found.title)).toBeInTheDocument();
  });
});
