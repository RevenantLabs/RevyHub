import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { AccountDataEntriesPanel } from "@/features/account-data-entries/components/AccountDataEntriesPanel";
import { copy, errorCopy } from "@/features/account-data-entries/copy";
import { handlers } from "@/features/account-data-entries/msw/handlers";
import {
  accountId,
  emptyDataResponse,
  secretSeed,
  textValue,
  unknownAccountId
} from "@/features/account-data-entries/fixtures/accountDataEntries.fixture";

const server = withMswHandlers(...handlers);

describe("AccountDataEntriesPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<AccountDataEntriesPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<AccountDataEntriesPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("renders text, byte and invalid rows with copy controls", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<AccountDataEntriesPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument());
    expect(screen.getByText(textValue)).toBeInTheDocument();
    expect(screen.getByText("00 ff 10 7f")).toBeInTheDocument();
    expect(screen.getByText(copy.typeInvalid)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `Copy ${copy.rawCopyLabel("greeting")}` })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `Copy ${copy.decodedCopyLabel("greeting")}` })
    ).toBeInTheDocument();
  });

  it("shows a distinct empty result when the account has no data", async () => {
    server.use(
      http.get(`https://horizon-testnet.stellar.org/accounts/${accountId}`, () =>
        HttpResponse.json(emptyDataResponse)
      )
    );
    resetHorizonClients();
    const { user } = renderFeature(<AccountDataEntriesPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.noEntriesTitle)).toBeInTheDocument();
  });

  it("explains when the account does not exist", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<AccountDataEntriesPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), unknownAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.account_not_found.title)).toBeInTheDocument();
  });

  it("clears and never echoes a submitted secret seed", async () => {
    const { container, user } = renderFeature(<AccountDataEntriesPanel />);
    const input = screen.getByLabelText(copy.formLabel);

    await user.type(input, secretSeed);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.invalid_address.title)).toBeInTheDocument();
    expect(input).toHaveValue("");
    expect(container.textContent).not.toContain(secretSeed);
  });
});
