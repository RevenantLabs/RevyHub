import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { AccountMergePreflightPanel } from "@/features/account-merge-preflight/components/AccountMergePreflightPanel";
import { sourceId, destinationId } from "@/features/account-merge-preflight/fixtures/account-merge-preflight.fixture";
import { copy } from "@/features/account-merge-preflight/copy";
import { resetHorizonClients } from "@/core/horizon/client";
import { handlers } from "@/features/account-merge-preflight/msw/handlers";

withMswHandlers(...handlers);

describe("AccountMergePreflightPanel", () => {
  it("submits and displays success", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<AccountMergePreflightPanel />);

    await user.type(screen.getByLabelText(copy.formSourceLabel), sourceId);
    await user.type(screen.getByLabelText(copy.formDestinationLabel), destinationId);
    await user.click(screen.getByRole("button", { name: copy.submit }));


    await screen.findByText(copy.mergeableTitle);
    expect(screen.getByText("Transferable XLM")).toBeInTheDocument();
  });
});
