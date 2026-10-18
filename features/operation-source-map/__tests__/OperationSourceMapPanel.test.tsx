import { describe, expect, it } from "vitest";
import { renderFeature, screen, within } from "@/core/testing/render";
import { OperationSourceMapPanel } from "@/features/operation-source-map/components/OperationSourceMapPanel";
import { copy, errorCopy } from "@/features/operation-source-map/copy";
import {
  feeBumpXdr,
  feeSource,
  mixedOverridesXdr,
  muxedOne,
  muxedTwo,
  muxedXdr,
  noOperationsXdr,
  noOverridesXdr,
  notBase64,
  opSourceA,
  secretSeed,
  txSource
} from "@/features/operation-source-map/fixtures/operationSourceMap.fixture";

type User = ReturnType<typeof renderFeature>["user"];

async function mapEnvelope(user: User, envelope: string) {
  await user.click(screen.getByLabelText(copy.formLabel));
  await user.paste(envelope);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("OperationSourceMapPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<OperationSourceMapPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows each operation with its origin", async () => {
    const { user } = renderFeature(<OperationSourceMapPanel />);
    await mapEnvelope(user, mixedOverridesXdr);

    expect(await screen.findByText(copy.operationsTitle)).toBeInTheDocument();
    expect(screen.getAllByText(copy.originInherited)).toHaveLength(2);
    expect(screen.getAllByText(copy.originOverridden)).toHaveLength(1);
    expect(screen.getAllByText(copy.noExplicitSource)).toHaveLength(2);
  });

  it("filters to overridden rows and back", async () => {
    const { user } = renderFeature(<OperationSourceMapPanel />);
    await mapEnvelope(user, mixedOverridesXdr);

    await user.selectOptions(await screen.findByLabelText(copy.filterLabel), "overridden");
    expect(screen.getAllByText(copy.originOverridden)).toHaveLength(1);
    expect(screen.queryByText(copy.originInherited)).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(copy.filterLabel), "all");
    expect(screen.getAllByText(copy.originInherited)).toHaveLength(2);
  });

  it("shows a no-match state with a reset that recovers from it", async () => {
    const { user } = renderFeature(<OperationSourceMapPanel />);
    await mapEnvelope(user, noOverridesXdr);

    await user.selectOptions(await screen.findByLabelText(copy.filterLabel), "overridden");
    expect(screen.getByText(copy.noMatchTitle)).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: copy.reset })[0]);
    expect(screen.queryByText(copy.noMatchTitle)).not.toBeInTheDocument();
    expect(screen.getAllByText(copy.originInherited)).toHaveLength(2);
  });

  it("keeps the fee payer out of the source groups", async () => {
    const { user } = renderFeature(<OperationSourceMapPanel />);
    await mapEnvelope(user, feeBumpXdr);

    expect(await screen.findByText(copy.labelFeePayer)).toBeInTheDocument();
    expect(screen.getByText(copy.feeBumpNote)).toBeInTheDocument();

    const groups = screen.getByText(copy.groupsTitle).closest("div")?.parentElement;
    expect(groups).toBeTruthy();
    if (groups) {
      expect(within(groups).queryByTitle(feeSource.publicKey())).not.toBeInTheDocument();
    }
  });

  it("groups two muxed addresses over one account separately", async () => {
    const { user } = renderFeature(<OperationSourceMapPanel />);
    await mapEnvelope(user, muxedXdr);

    expect(await screen.findByText(copy.groupsTitle)).toBeInTheDocument();
    expect(screen.getAllByTitle(muxedOne).length).toBeGreaterThan(0);
    expect(screen.getAllByTitle(muxedTwo).length).toBeGreaterThan(0);
    expect(screen.getAllByText(copy.labelBaseAccount).length).toBeGreaterThan(0);
  });

  it("offers a copyable deterministic JSON export", async () => {
    const { user } = renderFeature(<OperationSourceMapPanel />);
    await mapEnvelope(user, mixedOverridesXdr);

    expect(
      await screen.findByRole("button", { name: `Copy ${copy.copyExport}` })
    ).toBeInTheDocument();
    expect(screen.getByText(copy.exportDescription)).toBeInTheDocument();
    expect(screen.getByText(/"effectiveSource"/)).toBeInTheDocument();
  });

  it("states what the map does not evaluate", async () => {
    const { user } = renderFeature(<OperationSourceMapPanel />);
    await mapEnvelope(user, mixedOverridesXdr);

    expect(await screen.findByText(copy.scopeNote)).toBeInTheDocument();
  });

  it("says so plainly when there are no operations", async () => {
    const { user } = renderFeature(<OperationSourceMapPanel />);
    await mapEnvelope(user, noOperationsXdr);

    expect(await screen.findAllByText(copy.noOperations)).not.toHaveLength(0);
    expect(screen.queryByLabelText(copy.filterLabel)).not.toBeInTheDocument();
  });

  it("shows the transaction source as the inherited default", async () => {
    const { user } = renderFeature(<OperationSourceMapPanel />);
    await mapEnvelope(user, mixedOverridesXdr);

    expect(await screen.findByText(copy.labelTransactionSource)).toBeInTheDocument();
    expect(screen.getAllByTitle(txSource.publicKey()).length).toBeGreaterThan(0);
    expect(screen.getAllByTitle(opSourceA.publicKey()).length).toBeGreaterThan(0);
  });

  it("explains a bad paste", async () => {
    const { user } = renderFeature(<OperationSourceMapPanel />);
    await mapEnvelope(user, notBase64);

    expect(await screen.findByText(errorCopy.invalid_input.title)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("refuses a pasted secret key and clears it out of the field", async () => {
    const { container, user } = renderFeature(<OperationSourceMapPanel />);
    await mapEnvelope(user, secretSeed);

    expect(await screen.findByText(errorCopy.invalid_input.title)).toBeInTheDocument();
    // Refusing to decode it is not enough — it must not still be on screen.
    expect(screen.getByLabelText<HTMLTextAreaElement>(copy.formLabel).value).toBe("");
    expect(container.textContent ?? "").not.toContain(secretSeed);
  });

  it("leaves an ordinary bad paste in the field", async () => {
    const { user } = renderFeature(<OperationSourceMapPanel />);
    await mapEnvelope(user, notBase64);

    await screen.findByText(errorCopy.invalid_input.title);
    // Only a secret key triggers the redaction; clearing a typo would be hostile.
    expect(screen.getByLabelText<HTMLTextAreaElement>(copy.formLabel).value).toBe(notBase64);
  });
});
