import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { AssetIdentityValidatorPanel } from "@/features/asset-identity-validator/components/AssetIdentityValidatorPanel";
import { copy, errorCopy } from "@/features/asset-identity-validator/copy";
import {
  issuer,
  secretSeed,
  truncatedIssuer,
  validCode
} from "@/features/asset-identity-validator/fixtures/assetIdentityValidator.fixture";
import { alphanum4Codes } from "@/features/asset-identity-validator/fixtures/alphanum4-codes.fixture";
import { alphanum12Codes } from "@/features/asset-identity-validator/fixtures/alphanum12-codes.fixture";

async function submit(
  user: ReturnType<typeof renderFeature>["user"],
  code: string,
  issuerValue: string
) {
  await user.click(screen.getByLabelText(copy.codeLabel));
  await user.paste(code);
  await user.click(screen.getByLabelText(copy.issuerLabel));
  if (issuerValue) await user.paste(issuerValue);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("AssetIdentityValidatorPanel", () => {
  it("shows the empty state before anything is checked", () => {
    renderFeature(<AssetIdentityValidatorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("stacks the fields in a single column until the sm breakpoint", () => {
    renderFeature(<AssetIdentityValidatorPanel />);
    const code = screen.getByLabelText(copy.codeLabel);
    const grid = code.closest(".grid");

    expect(grid?.className).toContain("grid-cols-1");
    expect(grid?.className).toContain("sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]");
  });

  it("shows the canonical string and the detected tier", async () => {
    const { user } = renderFeature(<AssetIdentityValidatorPanel />);

    await submit(user, validCode, issuer);

    expect(await screen.findByText(copy.successTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.tierAlphanum4)).toBeInTheDocument();
    expect(screen.getByText(`${validCode}:${issuer}`)).toBeInTheDocument();
    expect(screen.getByText(issuer)).toBeInTheDocument();
    expect(screen.getByText("4 characters")).toBeInTheDocument();
  });

  it("explains a length failure instead of a generic error", async () => {
    const { user } = renderFeature(<AssetIdentityValidatorPanel />);

    await submit(user, alphanum12Codes.tooLong, issuer);

    expect(await screen.findByText(errorCopy.invalid_code_length.title)).toBeInTheDocument();
    expect(screen.queryByText(errorCopy.invalid_code_characters.title)).not.toBeInTheDocument();
  });

  it("explains a character failure for a lowercase code", async () => {
    const { user } = renderFeature(<AssetIdentityValidatorPanel />);

    await submit(user, alphanum4Codes.lowercase, issuer);

    expect(await screen.findByText(errorCopy.invalid_code_characters.title)).toBeInTheDocument();
  });

  it("explains a bad issuer", async () => {
    const { user } = renderFeature(<AssetIdentityValidatorPanel />);

    await submit(user, validCode, truncatedIssuer);

    expect(await screen.findByText(errorCopy.invalid_issuer.title)).toBeInTheDocument();
  });

  it("warns about a secret key and never renders it", async () => {
    const { user, container } = renderFeature(<AssetIdentityValidatorPanel />);

    await submit(user, validCode, secretSeed);

    expect(await screen.findByText(errorCopy.invalid_issuer.title)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.issuerLabel)).toHaveValue("");
    expect(container.textContent ?? "").not.toContain(secretSeed);
  });

  it("rejects XLM paired with an issuer", async () => {
    const { user } = renderFeature(<AssetIdentityValidatorPanel />);

    await submit(user, alphanum4Codes.native, issuer);

    expect(await screen.findByText(errorCopy.reserved_native_conflict.title)).toBeInTheDocument();
    expect(screen.queryByText(`${alphanum4Codes.native}:${issuer}`)).not.toBeInTheDocument();
  });

  it("prompts for a code when the code field is empty", async () => {
    const { user } = renderFeature(<AssetIdentityValidatorPanel />);

    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.empty_code.title)).toBeInTheDocument();
  });
});
