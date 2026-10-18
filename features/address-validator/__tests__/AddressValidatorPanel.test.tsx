import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { AddressValidatorPanel } from "@/features/address-validator/components/AddressValidatorPanel";
import { copy, errorCopy } from "@/features/address-validator/copy";
import {
  secretSeed,
  truncatedPublicKey,
  validPublicKey
} from "@/features/address-validator/fixtures/addressValidator.fixture";

describe("AddressValidatorPanel", () => {
  it("shows the empty state before anything is checked", () => {
    renderFeature(<AddressValidatorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("reports a valid address with its details", async () => {
    const { user } = renderFeature(<AddressValidatorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), validPublicKey);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.validTitle)).toBeInTheDocument();
    expect(screen.getByText("56 characters")).toBeInTheDocument();
  });

  it("explains a checksum failure instead of a generic error", async () => {
    const { user } = renderFeature(<AddressValidatorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), truncatedPublicKey);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(
      await screen.findByText(errorCopy.bad_checksum_or_length.title)
    ).toBeInTheDocument();
  });

  it("warns about a secret key and never renders it", async () => {
    const { user, container } = renderFeature(<AddressValidatorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), secretSeed);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.secret_seed_rejected.title)).toBeInTheDocument();
    expect(container.textContent ?? "").not.toContain(secretSeed);
  });

  it("prompts for input when submitted empty", async () => {
    const { user } = renderFeature(<AddressValidatorPanel />);

    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.empty_input.title)).toBeInTheDocument();
  });
});
