import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { FeeBumpInspectorPanel } from "@/features/fee-bump-inspector/components/FeeBumpInspectorPanel";
import { copy, errorCopy } from "@/features/fee-bump-inspector/copy";
import {
  feeSource,
  feeBumpXdr,
  innerSource,
  muxedFeeBumpXdr,
  muxedFeeSourceAddress,
  notBase64,
  ordinaryXdr,
  secretSeed,
  unsignedFeeBumpXdr
} from "@/features/fee-bump-inspector/fixtures/feeBumpInspector.fixture";

type User = ReturnType<typeof renderFeature>["user"];

async function inspect(user: User, envelope: string) {
  await user.click(screen.getByLabelText(copy.envelopeLabel));
  await user.paste(envelope);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("FeeBumpInspectorPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<FeeBumpInspectorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("renders the outer and inner layers as separate sections", async () => {
    const { user } = renderFeature(<FeeBumpInspectorPanel />);
    await inspect(user, feeBumpXdr);

    expect(await screen.findByText(copy.outerTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.innerTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.outerDescription)).toBeInTheDocument();
    expect(screen.getByText(copy.innerDescription)).toBeInTheDocument();
  });

  it("labels each hash copy action with the layer it belongs to", async () => {
    const { user } = renderFeature(<FeeBumpInspectorPanel />);
    await inspect(user, feeBumpXdr);

    expect(
      await screen.findByRole("button", { name: `Copy ${copy.copyOuterHash}` })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `Copy ${copy.copyInnerHash}` })
    ).toBeInTheDocument();
  });

  it("lists the inner operations in order", async () => {
    const { user } = renderFeature(<FeeBumpInspectorPanel />);
    await inspect(user, feeBumpXdr);

    expect(await screen.findByText("Payment")).toBeInTheDocument();
    expect(screen.getByText("Bump sequence")).toBeInTheDocument();
  });

  it("explains the fee bid without claiming the charged fee", async () => {
    const { user } = renderFeature(<FeeBumpInspectorPanel />);
    await inspect(user, feeBumpXdr);

    expect(await screen.findByText(copy.feeBidExplainer)).toBeInTheDocument();
    // The outer bid appears in the outer layer and again in the fee-bid card.
    expect(screen.getAllByText("600 stroops (0.0000600 XLM)")).toHaveLength(2);
    // 200 is the inner bid, restated in the fee-bid card, and the per-operation
    // ceiling — 600 spread over two operations plus the wrapper.
    expect(screen.getAllByText("200 stroops (0.0000200 XLM)")).toHaveLength(3);
    expect(screen.getByText(copy.labelMaxFeePerOperation)).toBeInTheDocument();
    expect(screen.getByText(copy.labelChargeableOperations)).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("states that signatures are counted, not verified", async () => {
    const { user } = renderFeature(<FeeBumpInspectorPanel />);
    await inspect(user, feeBumpXdr);

    expect(await screen.findByText(copy.signatureNote)).toBeInTheDocument();
    expect(screen.getByText(copy.hashNote)).toBeInTheDocument();
  });

  it("says so plainly when neither layer is signed", async () => {
    const { user } = renderFeature(<FeeBumpInspectorPanel />);
    await inspect(user, unsignedFeeBumpXdr);

    expect(await screen.findAllByText(copy.noSignatures)).toHaveLength(2);
  });

  it("shows a muxed fee source beside its underlying account", async () => {
    const { user } = renderFeature(<FeeBumpInspectorPanel />);
    await inspect(user, muxedFeeBumpXdr);

    expect(await screen.findAllByText(copy.labelBaseAccount)).not.toHaveLength(0);
    expect(
      screen.getByTitle(muxedFeeSourceAddress)
    ).toBeInTheDocument();
    expect(screen.getAllByTitle(feeSource.publicKey()).length).toBeGreaterThan(0);
    expect(screen.getAllByTitle(innerSource.publicKey()).length).toBeGreaterThan(0);
  });

  it("treats an ordinary envelope as a wrong-tool notice, not an error", async () => {
    const { user } = renderFeature(<FeeBumpInspectorPanel />);
    await inspect(user, ordinaryXdr);

    const notice = await screen.findByText(errorCopy.not_fee_bump.title);
    expect(notice).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(errorCopy.not_fee_bump.title);
  });

  it("explains a bad paste differently from a bad envelope", async () => {
    const { user } = renderFeature(<FeeBumpInspectorPanel />);
    await inspect(user, notBase64);

    expect(await screen.findByText(errorCopy.invalid_input.title)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("refuses a pasted secret key and clears it out of the field", async () => {
    const { container, user } = renderFeature(<FeeBumpInspectorPanel />);
    await inspect(user, secretSeed);

    expect(await screen.findByText(errorCopy.invalid_input.title)).toBeInTheDocument();
    // Refusing to decode it is not enough — it must not still be on screen.
    expect(screen.getByLabelText<HTMLTextAreaElement>(copy.envelopeLabel).value).toBe("");
    expect(container.textContent ?? "").not.toContain(secretSeed);
    expect(document.body.textContent ?? "").not.toContain(secretSeed);
  });

  it("asks for a passphrase when the custom option is left blank", async () => {
    const { user } = renderFeature(<FeeBumpInspectorPanel />);

    await user.click(screen.getByLabelText(copy.envelopeLabel));
    await user.paste(feeBumpXdr);
    await user.selectOptions(screen.getByLabelText(copy.networkLabel), "custom");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.empty_passphrase.title)).toBeInTheDocument();
  });

  it("hashes against a custom passphrase when one is given", async () => {
    const { user } = renderFeature(<FeeBumpInspectorPanel />);

    await user.click(screen.getByLabelText(copy.envelopeLabel));
    await user.paste(feeBumpXdr);
    await user.selectOptions(screen.getByLabelText(copy.networkLabel), "custom");
    await user.click(screen.getByLabelText(copy.customNetworkLabel));
    await user.paste("Standalone Network ; February 2017");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(copy.outerTitle)).toBeInTheDocument();
    expect(
      screen.getByText(/Custom network — Standalone Network ; February 2017/)
    ).toBeInTheDocument();
  });
});
