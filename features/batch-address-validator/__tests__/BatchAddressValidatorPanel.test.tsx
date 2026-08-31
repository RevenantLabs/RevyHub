import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { BatchAddressValidatorPanel } from "@/features/batch-address-validator/components/BatchAddressValidatorPanel";
import { copy, errorCopy } from "@/features/batch-address-validator/copy";
import {
  mixedAddressList,
  secretSeed,
  secretSeedList
} from "@/features/batch-address-validator/fixtures/batchAddressValidator.fixture";
import { validPublicKey } from "@/features/address-validator/fixtures/addressValidator.fixture";

describe("BatchAddressValidatorPanel", () => {
  it("shows the empty state before any input", () => {
    renderFeature(<BatchAddressValidatorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows per-line results and a summary for a mixed list", async () => {
    const { user } = renderFeature(<BatchAddressValidatorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), mixedAddressList.join("\n"));
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.summaryTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.linesTitle)).toBeInTheDocument();
    expect(screen.getByText("3 valid · 1 invalid · 2 duplicated")).toBeInTheDocument();
  });

  it("shows all-valid messaging for a clean list", async () => {
    const { user } = renderFeature(<BatchAddressValidatorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), validPublicKey);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.allValidTitle)).toBeInTheDocument();
  });

  it("warns about secret keys and never renders them", async () => {
    const { user, container } = renderFeature(<BatchAddressValidatorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), secretSeedList.join("\n"));
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.secretSeedRow)).toBeInTheDocument();
    expect(container.textContent ?? "").not.toContain(secretSeed);
  });

  it("prompts for input when submitted empty", async () => {
    const { user } = renderFeature(<BatchAddressValidatorPanel />);

    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.empty_input.title)).toBeInTheDocument();
  });
});
