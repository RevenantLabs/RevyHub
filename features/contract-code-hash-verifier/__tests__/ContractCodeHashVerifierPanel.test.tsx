import { expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { ContractCodeHashVerifierPanel } from "../components/ContractCodeHashVerifierPanel";
import { copy } from "../copy";
import { sample } from "../fixtures/contractCodeHashVerifier.fixture";
import { handlers } from "../msw/handlers";

withMswHandlers(...handlers);

it("shows a matching hash and clears it", async () => {
  const { user } = renderFeature(<ContractCodeHashVerifierPanel />);
  expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  const input = screen.getByLabelText(copy.fields.contractId.label);
  await user.clear(input);
  await user.click(input);
  await user.paste(sample.contractId);
  await user.click(screen.getByRole("button", { name: copy.submit }));
  expect(await screen.findByText(copy.verdicts.match)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: copy.reset }));
  expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
});

it("shows one alert for an empty contract ID", async () => {
  const { user } = renderFeature(<ContractCodeHashVerifierPanel />);
  await user.click(screen.getByRole("button", { name: copy.submit }));
  expect(await screen.findByRole("alert")).toBeInTheDocument();
});
