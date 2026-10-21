import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { TxrepConverterPanel } from "@/features/txrep-converter/components/TxrepConverterPanel";
import { TxrepConverterResult } from "@/features/txrep-converter/components/TxrepConverterResult";
import { copy } from "@/features/txrep-converter/copy";
import { sampleEnvelope } from "@/features/txrep-converter/fixtures/sample-envelope.fixture";

describe("TxrepConverterPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<TxrepConverterPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<TxrepConverterPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText("Paste an envelope first")).toBeInTheDocument();
  });

  it("shows the converted Txrep after a round trip", async () => {
    const { user } = renderFeature(<TxrepConverterPanel />);
    await user.click(screen.getByLabelText(copy.inputLabel));
    await user.paste(sampleEnvelope);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(copy.roundTripOk)).toBeInTheDocument();
    expect(screen.getByText(/type: ENVELOPE_TYPE_TX/)).toBeInTheDocument();
  });

  it("hides output when the round trip does not match", () => {
    renderFeature(
      <TxrepConverterResult
        result={{
          detected: "xdr",
          output: "type: ENVELOPE_TYPE_TX",
          outputFormat: "txrep",
          fieldCount: 1,
          roundTripMatched: false
        }}
      />
    );
    expect(screen.getByText(copy.roundTripFailed)).toBeInTheDocument();
    expect(screen.queryByText("type: ENVELOPE_TYPE_TX")).not.toBeInTheDocument();
  });
});
