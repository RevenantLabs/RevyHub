import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { SorobanFootprintDiffPanel } from "@/features/soroban-footprint-diff/components/SorobanFootprintDiffPanel";
import { copy, errorCopy } from "@/features/soroban-footprint-diff/copy";
import {
  firstSimulationJson,
  secondSimulationJson
} from "@/features/soroban-footprint-diff/fixtures/sorobanFootprintDiff.fixture";

type User = ReturnType<typeof renderFeature>["user"];

async function compare(user: User, first: string, second: string) {
  await user.click(screen.getByLabelText(copy.firstLabel));
  await user.paste(first);
  await user.click(screen.getByLabelText(copy.secondLabel));
  await user.paste(second);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("SorobanFootprintDiffPanel", () => {
  it("shows empty state", () => {
    renderFeature(<SorobanFootprintDiffPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("renders a successful comparison", async () => {
    const { user } = renderFeature(<SorobanFootprintDiffPanel />);
    await compare(user, firstSimulationJson, secondSimulationJson);
    expect(await screen.findByText(copy.modeTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.addedTitle)).toBeInTheDocument();
  });

  it("explains empty second result", async () => {
    const { user } = renderFeature(<SorobanFootprintDiffPanel />);
    await user.click(screen.getByLabelText(copy.firstLabel));
    await user.paste(firstSimulationJson);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(errorCopy.empty_second_result.title)).toBeInTheDocument();
  });
});
