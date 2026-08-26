import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { withMswHandlers } from "@/core/testing/msw";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { SequenceInspectorPanel } from "@/features/sequence-inspector/components/SequenceInspectorPanel";
import { handlers } from "@/features/sequence-inspector/msw/handlers";
import { accountId } from "@/features/sequence-inspector/fixtures/sequenceInspector.fixture";

withMswHandlers(...handlers);

function renderPanel() {
  return render(
    <NetworkProvider initialNetwork="testnet">
      <SequenceInspectorPanel />
    </NetworkProvider>
  );
}

describe("SequenceInspector a11y", () => {
  it("has no WCAG A/AA violations in the idle state", async () => {
    const { container } = renderPanel();
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations with a result shown", async () => {
    const { container } = renderPanel();
    
    await userEvent.type(screen.getByLabelText(/Account address/i), accountId);
    await userEvent.click(screen.getByRole("button", { name: /Inspect sequence/i }));
    
    await waitFor(() => {
      expect(screen.getByText("Sequence Details")).toBeInTheDocument();
    });
    
    await expectNoAxeViolations(container);
  });
});
