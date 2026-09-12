import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { StrkeyInspectorPanel } from "@/features/strkey-inspector/components/StrkeyInspectorPanel";
import { copy, errorCopy } from "@/features/strkey-inspector/copy";
import {
  muxedAddress,
  secretSeed,
  truncatedPublicKey,
  validPublicKey
} from "@/features/strkey-inspector/fixtures/strkeyInspector.fixture";

describe("StrkeyInspectorPanel", () => {
  it("shows the empty state before anything is inspected", () => {
    renderFeature(<StrkeyInspectorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("reports a valid StrKey with its details", async () => {
    const { user } = renderFeature(<StrkeyInspectorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), validPublicKey);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.resultTitle)).toBeInTheDocument();
    expect(screen.getByText("32 bytes")).toBeInTheDocument();
  });

  it("displays muxed account components including G address and ID", async () => {
    const { user } = renderFeature(<StrkeyInspectorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), muxedAddress);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.resultTitle)).toBeInTheDocument();
    expect(screen.getByText("40 bytes")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("explains a checksum failure instead of a generic error", async () => {
    const { user } = renderFeature(<StrkeyInspectorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), truncatedPublicKey);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(
      await screen.findByText(errorCopy.bad_checksum.title)
    ).toBeInTheDocument();
  });

  it("warns about a secret key and never renders it", async () => {
    const { user, container } = renderFeature(<StrkeyInspectorPanel />);

    await user.type(screen.getByLabelText(copy.formLabel), secretSeed);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(
      await screen.findByText(errorCopy.secret_seed_rejected.title)
    ).toBeInTheDocument();
    expect(container.textContent ?? "").not.toContain(secretSeed);
  });

  it("prompts for input when submitted empty", async () => {
    const { user } = renderFeature(<StrkeyInspectorPanel />);

    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(
      await screen.findByText(errorCopy.empty_input.title)
    ).toBeInTheDocument();
  });
});
