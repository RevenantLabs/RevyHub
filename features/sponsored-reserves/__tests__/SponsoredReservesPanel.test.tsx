import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderFeature } from "@/core/testing/render";
import { SponsoredReservesPanel } from "@/features/sponsored-reserves/components/SponsoredReservesPanel";
import { accountId } from "@/features/sponsored-reserves/fixtures/sponsoredReserves.fixture";
import { copy, errorCopy } from "@/features/sponsored-reserves/copy";
import { resetHorizonClients } from "@/core/horizon/client";
import { handlers } from "@/features/sponsored-reserves/msw/handlers";
import { withMswHandlers } from "@/core/testing/msw";

withMswHandlers(...handlers);

describe("SponsoredReservesPanel", () => {
  it("renders the empty state and form", () => {
    renderFeature(<SponsoredReservesPanel />);
    expect(screen.getByText(copy.description)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.formLabel)).toBeInTheDocument();
  });

  it("shows results on valid submission", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<SponsoredReservesPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    await waitFor(() => {
      expect(screen.getByText(copy.result.sponsoredByOthers)).toBeInTheDocument();
    });
    expect(screen.getByText(copy.result.sponsoringForOthers)).toBeInTheDocument();
  });

  it("does not render a secret key on error", async () => {
    const { user, container } = renderFeature(<SponsoredReservesPanel />);

    const secret = "SABC";
    await user.type(screen.getByLabelText(copy.formLabel), secret);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.invalid_address.title)).toBeInTheDocument();
    expect(container.textContent ?? "").not.toContain(secret);
  });
});
