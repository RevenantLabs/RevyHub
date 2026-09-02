import { describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { SorobanAuthInspectorPanel } from "@/features/soroban-auth-inspector/components/SorobanAuthInspectorPanel";
import { copy, errorCopy } from "@/features/soroban-auth-inspector/copy";
import {
  buildAuthTreeEnvelopeXdr,
  buildPaymentEnvelopeXdr
} from "@/features/soroban-auth-inspector/fixtures/sorobanAuthInspector.fixture";

describe("SorobanAuthInspectorPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<SorobanAuthInspectorPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<SorobanAuthInspectorPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("renders authorization entries for a valid envelope", async () => {
    const { user } = renderFeature(<SorobanAuthInspectorPanel />);

    await user.click(screen.getByLabelText(copy.formLabel));
    await user.paste(buildAuthTreeEnvelopeXdr());
    await user.click(screen.getByRole("button", { name: copy.submit }));

    await waitFor(() => expect(screen.getByText(copy.resultTitle)).toBeInTheDocument());
    expect(screen.getByText(copy.invocationTreeTitle)).toBeInTheDocument();
  });

  it("shows a non-Soroban error for a payment envelope", async () => {
    const { user } = renderFeature(<SorobanAuthInspectorPanel />);

    await user.click(screen.getByLabelText(copy.formLabel));
    await user.paste(buildPaymentEnvelopeXdr());
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.not_soroban.title)).toBeInTheDocument();
  });
});
