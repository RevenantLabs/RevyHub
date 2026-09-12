import { beforeEach, describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { LedgerLookupPanel } from "@/features/ledger-lookup/components/LedgerLookupPanel";
import { copy } from "@/features/ledger-lookup/copy";
import { handlers } from "@/features/ledger-lookup/msw/handlers";
import {
  futureSequence,
  missingSequence,
  sampleSequence
} from "@/features/ledger-lookup/fixtures/ledgerLookup.fixture";

withMswHandlers(...handlers);

describe("LedgerLookupPanel", () => {
  beforeEach(() => {
    resetHorizonClients();
  });

  it("renders the empty state before any input", () => {
    renderFeature(<LedgerLookupPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<LedgerLookupPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("renders full ledger summary on successful lookup", async () => {
    const { user } = renderFeature(<LedgerLookupPanel />);
    const input = screen.getByLabelText(copy.formLabel);
    await user.type(input, String(sampleSequence));
    await user.click(screen.getByRole("button", { name: copy.submit }));

    await waitFor(() => {
      expect(screen.getByText(copy.resultTitle)).toBeInTheDocument();
    });

    expect(screen.getByText("#50,000,000")).toBeInTheDocument();
    expect(screen.getByText(copy.closeTimeLabel)).toBeInTheDocument();
    expect(screen.getByText(copy.ageLabel)).toBeInTheDocument();
    expect(screen.getByText(copy.successfulTxLabel)).toBeInTheDocument();
    expect(screen.getByText("125")).toBeInTheDocument();
    expect(screen.getByText(copy.failedTxLabel)).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText(copy.feePoolLabel)).toBeInTheDocument();
    expect(screen.getByText(copy.totalCoinsLabel)).toBeInTheDocument();
    expect(screen.getByText(copy.baseFeeLabel)).toBeInTheDocument();
    expect(screen.getByText(copy.baseReserveLabel)).toBeInTheDocument();
    expect(screen.getByText(copy.protocolVersionLabel)).toBeInTheDocument();
  });

  it("renders future ledger rejection with the current height stated", async () => {
    const { user } = renderFeature(<LedgerLookupPanel />);
    const input = screen.getByLabelText(copy.formLabel);
    await user.type(input, String(futureSequence));
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText(copy.futureLedgerWithHeight(sampleSequence))
    ).toBeInTheDocument();
  });

  it("renders ledger not found message for retained boundary misses", async () => {
    const { user } = renderFeature(<LedgerLookupPanel />);
    const input = screen.getByLabelText(copy.formLabel);
    await user.type(input, String(missingSequence));
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText(/outside the retained history range/)
    ).toBeInTheDocument();
  });
});
