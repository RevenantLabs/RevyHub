import { describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { ContractEventsPanel } from "@/features/contract-events/components/ContractEventsPanel";
import { copy, errorCopy } from "@/features/contract-events/copy";
import { handlers } from "@/features/contract-events/msw/handlers";
import {
  contractId,
  endLedger,
  startLedger,
  unknownContractId
} from "@/features/contract-events/fixtures/contractEvents.fixture";

withMswHandlers(...handlers);

describe("ContractEventsPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<ContractEventsPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("renders events after a successful fetch", async () => {
    const { user } = renderFeature(<ContractEventsPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), contractId);
    await user.type(screen.getByLabelText(copy.startLedgerLabel), String(startLedger));
    await user.type(screen.getByLabelText(copy.endLedgerLabel), String(endLedger));
    await user.click(screen.getByRole("button", { name: copy.submit }));

    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument());
    expect(screen.getByText("transfer")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<ContractEventsPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("explains no events instead of a raw error", async () => {
    const { user } = renderFeature(<ContractEventsPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), unknownContractId);
    await user.type(screen.getByLabelText(copy.startLedgerLabel), String(startLedger));
    await user.type(screen.getByLabelText(copy.endLedgerLabel), String(endLedger));
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.no_events.title)).toBeInTheDocument();
  });

  it("validates the contract ID before sending a request", async () => {
    const { user } = renderFeature(<ContractEventsPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), "CNOPE");
    await user.type(screen.getByLabelText(copy.startLedgerLabel), "100");
    await user.type(screen.getByLabelText(copy.endLedgerLabel), "200");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.invalid_contract_id.title)).toBeInTheDocument();
  });
});
