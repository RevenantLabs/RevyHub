import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { TransactionLookupPanel } from "@/features/transaction-lookup/components/TransactionLookupPanel";
import { copy, errorCopy } from "@/features/transaction-lookup/copy";
import { handlers } from "@/features/transaction-lookup/msw/handlers";
import {
  failedHash,
  missingHash,
  successfulHash
} from "@/features/transaction-lookup/fixtures/transactionLookup.fixture";

withMswHandlers(...handlers);

describe("TransactionLookupPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<TransactionLookupPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("renders the summary and operations of a successful transaction", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<TransactionLookupPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), successfulHash);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.succeeded)).toBeInTheDocument();
    expect(screen.getByText("Payment")).toBeInTheDocument();
    expect(screen.getByText("Change trust")).toBeInTheDocument();
    expect(screen.getByText("100 stroops (0.00001 XLM)")).toBeInTheDocument();
  });

  it("marks a failed transaction as failed rather than as an error", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<TransactionLookupPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), failedHash);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.failed)).toBeInTheDocument();
    expect(screen.getByText(copy.noOperations)).toBeInTheDocument();
  });

  it("explains that a hash is not an account address", async () => {
    const { user } = renderFeature(<TransactionLookupPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), "GABC");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.invalid_hash.title)).toBeInTheDocument();
  });

  it("points at the network switch when a hash is not found", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<TransactionLookupPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), missingHash);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.not_found.title)).toBeInTheDocument();
  });
});
