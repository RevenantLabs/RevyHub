import { describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { OfferInspectorPanel } from "@/features/offer-inspector/components/OfferInspectorPanel";
import { copy, errorCopy } from "@/features/offer-inspector/copy";
import { handlers } from "@/features/offer-inspector/msw/handlers";
import {
  accountId,
  emptyOffersAccountId,
  unknownAccountId
} from "@/features/offer-inspector/fixtures/offerInspector.fixture";

withMswHandlers(...handlers);

describe("OfferInspectorPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<OfferInspectorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<OfferInspectorPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("validates the address before sending a request", async () => {
    const { user } = renderFeature(<OfferInspectorPanel />);
    await user.type(screen.getByLabelText(copy.formLabel), "GNOPE");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.invalid_address.title)).toBeInTheDocument();
  });

  it("rejects secret seed starting with S", async () => {
    const { user } = renderFeature(<OfferInspectorPanel />);
    await user.type(screen.getByLabelText(copy.formLabel), "S".repeat(56));
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.invalid_address.title)).toBeInTheDocument();
  });

  it("renders open offers in a labelled table with reserve requirements", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<OfferInspectorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument());
    expect(screen.getByRole("rowheader", { name: "20001" })).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "20002" })).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("1 XLM (2 subentries)")).toBeInTheDocument();
  });

  it("displays zero offers message when account has no open offers", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<OfferInspectorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), emptyOffersAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    await waitFor(() => expect(screen.getByText(copy.noOffersTitle)).toBeInTheDocument());
    expect(screen.getByText(copy.noOffersDescription)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("explains a missing account instead of a generic error", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<OfferInspectorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), unknownAccountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.account_not_found.title)).toBeInTheDocument();
  });
});

