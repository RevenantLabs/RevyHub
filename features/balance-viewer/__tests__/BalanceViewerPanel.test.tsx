import { describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { BalanceViewerPanel } from "@/features/balance-viewer/components/BalanceViewerPanel";
import { copy, errorCopy } from "@/features/balance-viewer/copy";
import { handlers } from "@/features/balance-viewer/msw/handlers";
import {
  accountId,
  unknownAccountId
} from "@/features/balance-viewer/fixtures/balanceViewer.fixture";

withMswHandlers(...handlers);

describe("BalanceViewerPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<BalanceViewerPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("renders every balance line in a labelled table", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<BalanceViewerPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument());
    expect(screen.getByRole("rowheader", { name: /XLM \(native\)/ })).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: /USDC/ })).toBeInTheDocument();
    expect(screen.getByText("1,250.5")).toBeInTheDocument();
  });

  it("filters balance rows client-side without refetching", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<BalanceViewerPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument());

    await user.type(screen.getByLabelText(copy.filterLabel), "USDC");
    expect(screen.queryByRole("rowheader", { name: /XLM \(native\)/ })).not.toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: /USDC/ })).toBeInTheDocument();

    await user.clear(screen.getByLabelText(copy.filterLabel));
    expect(screen.getByRole("rowheader", { name: /XLM \(native\)/ })).toBeInTheDocument();
  });

  it("shows an empty filter state when nothing matches", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<BalanceViewerPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument());

    await user.type(screen.getByLabelText(copy.filterLabel), "zzznomatch");
    expect(screen.getByText(copy.filterEmptyTitle)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("explains a missing account instead of a raw error", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<BalanceViewerPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), unknownAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.account_not_found.title)).toBeInTheDocument();
  });

  it("validates the address before sending a request", async () => {
    const { user } = renderFeature(<BalanceViewerPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), "GNOPE");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.invalid_address.title)).toBeInTheDocument();
  });
});
