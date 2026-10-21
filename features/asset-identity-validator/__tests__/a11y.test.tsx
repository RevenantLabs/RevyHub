import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { AssetIdentityValidatorPanel } from "@/features/asset-identity-validator/components/AssetIdentityValidatorPanel";
import { copy, errorCopy } from "@/features/asset-identity-validator/copy";
import {
  issuer,
  validCode
} from "@/features/asset-identity-validator/fixtures/assetIdentityValidator.fixture";
import { alphanum4Codes } from "@/features/asset-identity-validator/fixtures/alphanum4-codes.fixture";

describe("AssetIdentityValidatorPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<AssetIdentityValidatorPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations once a result is shown", async () => {
    const { container, user } = renderFeature(<AssetIdentityValidatorPanel />);

    await user.click(screen.getByLabelText(copy.codeLabel));
    await user.paste(validCode);
    await user.click(screen.getByLabelText(copy.issuerLabel));
    await user.paste(issuer);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.successTitle);

    await expectNoAxeViolations(container);
  });

  it("has no WCAG A/AA violations while showing an error", async () => {
    const { container, user } = renderFeature(<AssetIdentityValidatorPanel />);

    await user.click(screen.getByLabelText(copy.codeLabel));
    await user.paste(alphanum4Codes.lowercase);
    await user.click(screen.getByLabelText(copy.issuerLabel));
    await user.paste(issuer);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("alert");
    expect(screen.getByText(errorCopy.invalid_code_characters.title)).toBeInTheDocument();

    await expectNoAxeViolations(container);
  });
});
