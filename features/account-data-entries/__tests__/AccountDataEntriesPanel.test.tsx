import { describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { resetHorizonClients } from "@/core/horizon/client";
import { withMswHandlers } from "@/core/testing/msw";
import { AccountDataEntriesPanel } from "@/features/account-data-entries/components/AccountDataEntriesPanel";
import { copy, errorCopy } from "@/features/account-data-entries/copy";
import { handlers } from "@/features/account-data-entries/msw/handlers";
import {
  accountId,
  emptyAccountId,
  unknownAccountId,
  secretSeed
} from "@/features/account-data-entries/fixtures/accountDataEntries.fixture";

withMswHandlers(...handlers);

describe("AccountDataEntriesPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<AccountDataEntriesPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("renders text, bytes and invalid rows in a table", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<AccountDataEntriesPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument());
    expect(screen.getByText("verified")).toBeInTheDocument();
    expect(screen.getByText("0x00ff10")).toBeInTheDocument();
    expect(screen.getByText(copy.invalidRowsTitle)).toBeInTheDocument();
  });

  it("shows an empty result for an account with no data entries", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<AccountDataEntriesPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), emptyAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.noEntriesTitle)).toBeInTheDocument();
  });

  it("explains a missing account instead of a raw error", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<AccountDataEntriesPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), unknownAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.account_not_found.title)).toBeInTheDocument();
  });

  it("rejects a secret seed before submitting", async () => {
    const { user } = renderFeature(<AccountDataEntriesPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), secretSeed);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.invalid_address.title)).toBeInTheDocument();
  });
});
