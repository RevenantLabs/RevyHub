import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { AddressValidatorPanel } from "@/features/address-validator/components/AddressValidatorPanel";
import { copy } from "@/features/address-validator/copy";
import { validPublicKey } from "@/features/address-validator/fixtures/addressValidator.fixture";

describe("AddressValidatorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<AddressValidatorPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations once a result is shown", async () => {
    const { container, user } = renderFeature(<AddressValidatorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), validPublicKey);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.validTitle);

    await expectNoAxeViolations(container);
  });
});
