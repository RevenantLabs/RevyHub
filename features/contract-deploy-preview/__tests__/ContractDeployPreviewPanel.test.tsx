import { expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { ContractDeployPreviewPanel } from "../components/ContractDeployPreviewPanel";
import { copy } from "../copy";
import { sample } from "../fixtures/contractDeployPreview.fixture";

it("shows the empty state before any input", () => {
  renderFeature(<ContractDeployPreviewPanel />);
  expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
});

it("previews a valid envelope and resets", async () => {
  const { user } = renderFeature(<ContractDeployPreviewPanel />);
  await user.click(screen.getByLabelText(copy.fieldLabel));
  await user.paste(sample.envelope);
  await user.click(screen.getByRole("button", { name: copy.submit }));
  expect(await screen.findByText(copy.resultTitle)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: copy.reset }));
  expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
});

it("shows a validation error for empty input", async () => {
  const { user } = renderFeature(<ContractDeployPreviewPanel />);
  await user.click(screen.getByRole("button", { name: copy.submit }));
  expect(await screen.findByRole("alert")).toBeInTheDocument();
});
