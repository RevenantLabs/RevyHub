import { describe, expect, it } from "vitest";
import { renderFeature, screen, within } from "@/core/testing/render";
import { ContractUpgradeDiffReportPanel } from "@/features/contract-upgrade-diff-report/components/ContractUpgradeDiffReportPanel";
import {
  copy,
  errorCopy,
  errorTitleFor,
  evidenceLabels,
  reasonLabels
} from "@/features/contract-upgrade-diff-report/copy";
import { newWasm, oldWasm, wasmFile } from "@/features/contract-upgrade-diff-report/fixtures/normal.fixture";
import {
  baselineWasm,
  duplicateConflictingEnvWasm,
  functionCollisionWasm,
  noSpecWasm,
  notWasmBytes,
  secretSeed,
  secretSeedBytes
} from "@/features/contract-upgrade-diff-report/fixtures/boundary.fixture";

async function compare(oldFile: File, newFile: File) {
  const view = renderFeature(<ContractUpgradeDiffReportPanel />);
  await view.user.upload(screen.getByLabelText(copy.oldLabel), oldFile);
  await view.user.upload(screen.getByLabelText(copy.newLabel), newFile);
  await view.user.click(screen.getByRole("button", { name: copy.submit }));
  return view;
}

describe("ContractUpgradeDiffReportPanel", () => {
  it("renders the empty state and labelled file inputs before any input", () => {
    renderFeature(<ContractUpgradeDiffReportPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.oldLabel)).toHaveAttribute("type", "file");
    expect(screen.getByLabelText(copy.newLabel)).toHaveAccessibleDescription(copy.newHint);
  });

  it("announces a missing file once and marks that input invalid", async () => {
    const { user } = renderFeature(<ContractUpgradeDiffReportPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    const alerts = await screen.findAllByRole("alert");
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toHaveTextContent(errorTitleFor("invalid_input", "old"));
    expect(screen.getByLabelText(copy.oldLabel)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(copy.newLabel)).toHaveAttribute("aria-invalid", "false");
  });

  it("shows the normal upgrade with added, removed and changed declarations", async () => {
    await compare(wasmFile(oldWasm, "token-v1.wasm"), wasmFile(newWasm, "token-v2.wasm"));

    expect(await screen.findByText(copy.breakingTitle)).toBeInTheDocument();
    expect(screen.queryByText(copy.incompleteTitle)).not.toBeInTheDocument();
    expect(screen.getByText("legacy_mint")).toBeInTheDocument();
    expect(screen.getByText("burn")).toBeInTheDocument();
    expect(screen.getByText(/returns/)).toBeInTheDocument();
    expect(screen.getAllByText("token-v1.wasm").length).toBeGreaterThan(0);
    expect(screen.getByText(copy.environmentChangedNote)).toBeInTheDocument();
    expect(screen.getByText("Protocol 21")).toBeInTheDocument();
    expect(screen.getByText("Protocol 22")).toBeInTheDocument();
    expect(screen.getByText(copy.disclaimer)).toBeInTheDocument();
    expect(screen.getByText(copy.noGaps)).toBeInTheDocument();
  });

  it("calls out incomplete evidence and never asserts a removal without a spec", async () => {
    await compare(wasmFile(noSpecWasm, "old.wasm"), wasmFile(baselineWasm, "new.wasm"));

    expect(await screen.findByText(copy.incompleteTitle)).toBeInTheDocument();
    expect(screen.queryByText(copy.additiveTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(copy.sameInterfaceTitle)).not.toBeInTheDocument();
    expect(screen.getAllByText(reasonLabels.spec_unavailable).length).toBeGreaterThan(0);
    expect(screen.queryByText("Removed")).not.toBeInTheDocument();
    expect(screen.queryByText("Added")).not.toBeInTheDocument();
    expect(screen.getAllByText(evidenceLabels.absent).length).toBeGreaterThan(0);
  });

  it("shows a name collision and a conflicting environment as gaps", async () => {
    await compare(wasmFile(functionCollisionWasm, "old.wasm"), wasmFile(duplicateConflictingEnvWasm, "new.wasm"));

    expect(await screen.findByText(copy.incompleteTitle)).toBeInTheDocument();
    expect(screen.getByText(reasonLabels.name_collision)).toBeInTheDocument();
    expect(screen.getByText(reasonLabels.env_unavailable)).toBeInTheDocument();
    expect(screen.getAllByText(evidenceLabels.conflicting).length).toBeGreaterThan(0);
    expect(screen.getByText(/transfer is declared 2 times with different shapes/)).toBeInTheDocument();
  });

  it("reports a non-Wasm upload against its side", async () => {
    await compare(wasmFile(oldWasm, "old.wasm"), wasmFile(notWasmBytes, "archive.zip"));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(errorTitleFor("malformed_data", "new"));
    expect(alert).toHaveTextContent(errorCopy.malformed_data.description);
  });

  it("refuses a secret seed file and never renders it", async () => {
    const { container } = await compare(wasmFile(secretSeedBytes, `${secretSeed}.txt`), wasmFile(newWasm, "n.wasm"));
    expect(await screen.findByRole("alert")).toHaveTextContent(errorTitleFor("invalid_input", "old"));
    expect(container.textContent).not.toContain(secretSeed);
  });

  it("renders uploaded names as inert text", async () => {
    const name = "<img src=x onerror=alert(1)>.wasm";
    const { container } = await compare(wasmFile(oldWasm, name), wasmFile(newWasm, "new.wasm"));
    expect((await screen.findAllByText(name)).length).toBeGreaterThan(0);
    expect(container.querySelector("img")).toBeNull();
  });

  it("returns to the empty state on clear", async () => {
    const { user } = await compare(wasmFile(oldWasm, "old.wasm"), wasmFile(newWasm, "new.wasm"));
    await screen.findByText(copy.breakingTitle);
    await user.click(screen.getByRole("button", { name: copy.reset }));
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    expect((screen.getByLabelText(copy.oldLabel) as HTMLInputElement).files).toHaveLength(0);
  });

  it("lists evidence coverage for both files", async () => {
    await compare(wasmFile(oldWasm, "old.wasm"), wasmFile(newWasm, "new.wasm"));
    const coverage = (await screen.findByText(copy.coverageTitle)).closest("div")!.parentElement!;
    expect(within(coverage).getAllByText(evidenceLabels.present)).toHaveLength(6);
  });
});
