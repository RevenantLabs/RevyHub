import { describe, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { expectNoAxeViolations } from "@/core/testing/axe";
import { ContractUpgradeDiffReportPanel } from "@/features/contract-upgrade-diff-report/components/ContractUpgradeDiffReportPanel";
import { copy } from "@/features/contract-upgrade-diff-report/copy";
import { newWasm, oldWasm, wasmFile } from "@/features/contract-upgrade-diff-report/fixtures/normal.fixture";
import { functionCollisionWasm, noSpecWasm } from "@/features/contract-upgrade-diff-report/fixtures/boundary.fixture";

async function compare(oldBytes: Uint8Array, newBytes: Uint8Array) {
  const view = renderFeature(<ContractUpgradeDiffReportPanel />);
  await view.user.upload(screen.getByLabelText(copy.oldLabel), wasmFile(oldBytes, "old.wasm"));
  await view.user.upload(screen.getByLabelText(copy.newLabel), wasmFile(newBytes, "new.wasm"));
  await view.user.click(screen.getByRole("button", { name: copy.submit }));
  return view;
}

describe("ContractUpgradeDiffReportPanel accessibility", () => {
  it("has no WCAG A/AA violations in its initial state", async () => {
    const { container } = renderFeature(<ContractUpgradeDiffReportPanel />);
    await expectNoAxeViolations(container);
  });

  it("has no violations in the error state", async () => {
    const { container, user } = renderFeature(<ContractUpgradeDiffReportPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("alert");
    await expectNoAxeViolations(container);
  });

  it("has no violations with a complete result shown", async () => {
    const { container } = await compare(oldWasm, newWasm);
    await screen.findByText(copy.breakingTitle);
    await expectNoAxeViolations(container);
  });

  it("has no violations with incomplete evidence shown", async () => {
    const { container } = await compare(noSpecWasm, functionCollisionWasm);
    await screen.findByText(copy.incompleteTitle);
    await expectNoAxeViolations(container);
  });
});
