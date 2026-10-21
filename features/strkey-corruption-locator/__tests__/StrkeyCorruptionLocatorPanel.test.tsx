import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { StrkeyCorruptionLocatorPanel } from "@/features/strkey-corruption-locator/components/StrkeyCorruptionLocatorPanel";
import { copy, errorCopy } from "@/features/strkey-corruption-locator/copy";
import { originalPublicKey, singleCharTypo } from "@/features/strkey-corruption-locator/fixtures/single-char-typo.fixture";
import { unfixableString } from "@/features/strkey-corruption-locator/fixtures/unfixable-string.fixture";
import { secretSeed, validPublicKey } from "@/features/strkey-corruption-locator/fixtures/strkeyCorruptionLocator.fixture";

describe("StrkeyCorruptionLocatorPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<StrkeyCorruptionLocatorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("asks for input when submitted empty", async () => {
    const { user } = renderFeature(<StrkeyCorruptionLocatorPanel />);

    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByRole("alert")).toHaveTextContent(errorCopy.empty_input.title);
  });

  it("shows the recovered public key for a single-character typo", async () => {
    const { user } = renderFeature(<StrkeyCorruptionLocatorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), singleCharTypo);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.resultTitle)).toBeInTheDocument();
    expect(screen.getByText(originalPublicKey)).toBeInTheDocument();
  });

  it("rejects a valid key without a correction list", async () => {
    const { user } = renderFeature(<StrkeyCorruptionLocatorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), validPublicKey);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.already_valid.title)).toBeInTheDocument();
    expect(screen.queryByText(copy.resultTitle)).not.toBeInTheDocument();
  });

  it("warns about a secret seed and never renders it", async () => {
    const { user, container } = renderFeature(<StrkeyCorruptionLocatorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), secretSeed);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.contains_secret_seed.title)).toBeInTheDocument();
    expect(container.textContent ?? "").not.toContain(secretSeed);
  });

  it("shows the no-candidates notice for an unfixable string", async () => {
    const { user } = renderFeature(<StrkeyCorruptionLocatorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), unfixableString);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.no_candidates_found.title)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
