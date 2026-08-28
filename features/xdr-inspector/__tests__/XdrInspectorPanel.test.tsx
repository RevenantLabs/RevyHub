import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { XdrInspectorPanel } from "@/features/xdr-inspector/components/XdrInspectorPanel";
import { copy, errorCopy } from "@/features/xdr-inspector/copy";
import {
  expiredXdr,
  feeBumpXdr,
  notBase64,
  paymentXdr,
  unboundedXdr
} from "@/features/xdr-inspector/fixtures/xdrInspector.fixture";

async function inspect(user: ReturnType<typeof renderFeature>["user"], value: string) {
  await user.click(screen.getByLabelText(copy.formLabel));
  await user.paste(value);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("XdrInspectorPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<XdrInspectorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("renders the summary and operation list for a valid envelope", async () => {
    const { user } = renderFeature(<XdrInspectorPanel />);
    await inspect(user, paymentXdr);

    expect(await screen.findByText(copy.summaryTitle)).toBeInTheDocument();
    expect(screen.getByText("Payment")).toBeInTheDocument();
    expect(screen.getByText("Bump sequence")).toBeInTheDocument();
    expect(screen.getByText("Invoice 1001 (text)")).toBeInTheDocument();
  });

  it("states that signatures are counted, not verified", async () => {
    const { user } = renderFeature(<XdrInspectorPanel />);
    await inspect(user, paymentXdr);

    expect(await screen.findByText(copy.signatureNote)).toBeInTheDocument();
  });

  it("shows the fee-bump wrapper separately from the inner transaction", async () => {
    const { user } = renderFeature(<XdrInspectorPanel />);
    await inspect(user, feeBumpXdr);

    expect(await screen.findByText(copy.feeBumpTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.feeBumpExplainer)).toBeInTheDocument();
  });

  it("warns when the time bounds have already passed", async () => {
    const { user } = renderFeature(<XdrInspectorPanel />);
    await inspect(user, expiredXdr);

    expect(await screen.findByText(copy.expiredTitle)).toBeInTheDocument();
  });

  it("says an unbounded envelope stays valid indefinitely", async () => {
    const { user } = renderFeature(<XdrInspectorPanel />);
    await inspect(user, unboundedXdr);

    expect(await screen.findByText(/Unbounded → Unbounded/)).toBeInTheDocument();
  });

  it("explains a bad paste differently from a bad envelope", async () => {
    const { user } = renderFeature(<XdrInspectorPanel />);
    await inspect(user, notBase64);

    expect(await screen.findByText(errorCopy.invalid_base64.title)).toBeInTheDocument();
  });
});
