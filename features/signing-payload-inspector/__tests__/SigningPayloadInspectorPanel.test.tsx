import { describe, expect, it } from "vitest";
import { renderFeature, screen, within } from "@/core/testing/render";
import { SigningPayloadInspectorPanel } from "@/features/signing-payload-inspector/components/SigningPayloadInspectorPanel";
import { copy, errorCopy } from "@/features/signing-payload-inspector/copy";
import { classicXdr } from "@/features/signing-payload-inspector/fixtures/classic-envelope.fixture";
import { feeBumpXdr } from "@/features/signing-payload-inspector/fixtures/fee-bump-envelope.fixture";

async function inspect(user: ReturnType<typeof renderFeature>["user"], value: string) {
  await user.click(screen.getByLabelText(copy.formLabel));
  await user.paste(value);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("SigningPayloadInspectorPanel", () => {
  it("shows guidance before interaction and an actionable empty error", async () => {
    const { user } = renderFeature(<SigningPayloadInspectorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(errorCopy.empty_xdr.title)).toBeInTheDocument();
  });
  it("shows the complete classic payload", async () => {
    const { user } = renderFeature(<SigningPayloadInspectorPanel />);
    await inspect(user, classicXdr);
    expect(await screen.findByText(copy.classicTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.networkIdTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.signatureBaseTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.payloadHashTitle)).toBeInTheDocument();
    expect(screen.getByTestId("signature-base").textContent).toMatch(/^[0-9a-f]+$/);
    expect(screen.getByTestId("payload-hash").textContent).toMatch(/^[0-9a-f]{64}$/);
  });
  it("shows both distinct fee-bump hashes", async () => {
    const { user } = renderFeature(<SigningPayloadInspectorPanel />);
    await inspect(user, feeBumpXdr);
    const outer = await screen.findByText(copy.outerTitle);
    const inner = screen.getByText(copy.innerTitle);
    const outerCard = outer.closest("article") ?? outer.parentElement?.parentElement;
    const innerCard = inner.closest("article") ?? inner.parentElement?.parentElement;
    expect(outerCard).toBeTruthy();
    expect(innerCard).toBeTruthy();
    const hashes = screen.getAllByTestId("payload-hash");
    expect(hashes).toHaveLength(2);
    expect(hashes[0].textContent).not.toBe(hashes[1].textContent);
    expect(screen.getByText(copy.feeBumpNote)).toBeInTheDocument();
  });
  it("clears a result when the selected network changes", async () => {
    const { user } = renderFeature(<SigningPayloadInspectorPanel />);
    await inspect(user, classicXdr);
    await screen.findByText(copy.classicTitle);
    await user.selectOptions(screen.getByLabelText(copy.networkLabel), "mainnet");
    expect(screen.queryByText(copy.classicTitle)).not.toBeInTheDocument();
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });
  it("does not echo a malformed paste", async () => {
    const { user } = renderFeature(<SigningPayloadInspectorPanel />);
    await inspect(user, "definitely-not-xdr!");
    expect(await screen.findByText(errorCopy.invalid_xdr.title)).toBeInTheDocument();
    expect(within(screen.getByRole("alert")).queryByText("definitely-not-xdr!")).toBeNull();
  });
});
