import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
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

describe("SequenceInspectorPanel", () => {
  it("renders sequence details on successful lookup", async () => {
    resetHorizonClients();
    renderPanel();
    
    const input = screen.getByLabelText(/Account address/i);
    await userEvent.type(input, accountId);
    
    const submit = screen.getByRole("button", { name: /Inspect sequence/i });
    await userEvent.click(submit);
    
    await waitFor(() => {
      expect(screen.getByText("Sequence Details")).toBeInTheDocument();
      expect(screen.getByText("18659541252046848")).toBeInTheDocument();
      expect(screen.getByText("4344513")).toBeInTheDocument();
      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("18659541252046849")).toBeInTheDocument();
    });
  });
});
