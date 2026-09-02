import { describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { ContractStoragePanel } from "@/features/contract-storage/components/ContractStoragePanel";
import { copy, errorCopy } from "@/features/contract-storage/copy";
import { handlers } from "@/features/contract-storage/msw/handlers";
import {
  contractId,
  unknownContractId
} from "@/features/contract-storage/fixtures/contractStorage.fixture";

withMswHandlers(...handlers);

describe("ContractStoragePanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<ContractStoragePanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("renders storage entries after a successful inspection", async () => {
    const { user } = renderFeature(<ContractStoragePanel />);

    await user.type(screen.getByLabelText(copy.formLabel), contractId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument());
    expect(screen.getByRole("rowheader", { name: /counter/ })).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<ContractStoragePanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("explains a missing contract instead of a raw error", async () => {
    const { user } = renderFeature(<ContractStoragePanel />);

    await user.type(screen.getByLabelText(copy.formLabel), unknownContractId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.contract_not_found.title)).toBeInTheDocument();
  });

  it("validates the contract ID before sending a request", async () => {
    const { user } = renderFeature(<ContractStoragePanel />);

    await user.type(screen.getByLabelText(copy.formLabel), "CNOPE");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.invalid_contract_id.title)).toBeInTheDocument();
  });
});
