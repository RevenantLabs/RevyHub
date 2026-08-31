import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { MultisigAnalyzerPanel } from "@/features/multisig-analyzer/components/MultisigAnalyzerPanel";
import { copy } from "@/features/multisig-analyzer/copy";

describe("MultisigAnalyzerPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<MultisigAnalyzerPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<MultisigAnalyzerPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
