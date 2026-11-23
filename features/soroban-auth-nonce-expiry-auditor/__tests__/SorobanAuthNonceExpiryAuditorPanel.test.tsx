import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { SorobanAuthNonceExpiryAuditorPanel } from "../components/SorobanAuthNonceExpiryAuditorPanel";
import { copy, errorCopy } from "../copy";
import { duplicateBundle, addressEntry } from "../fixtures/normal.fixture";
import { separateAccountsBundle } from "../fixtures/boundary.fixture";
import { Networks } from "@stellar/stellar-sdk";
async function submit(user: ReturnType<typeof renderFeature>["user"], bundle: string, ledger = "100") {
  await user.click(screen.getByLabelText(copy.bundleLabel)); await user.paste(bundle);
  await user.selectOptions(screen.getByLabelText(copy.networkLabel), Networks.TESTNET);
  if (ledger) { await user.click(screen.getByLabelText(copy.ledgerLabel)); await user.type(screen.getByLabelText(copy.ledgerLabel), ledger); }
  await user.click(screen.getByRole("button", {name: copy.submit}));
}
describe("audit panel", () => {
  it("requires a deliberate network selection", async () => {
    const {user} = renderFeature(<SorobanAuthNonceExpiryAuditorPanel/>);
    await user.click(screen.getByLabelText(copy.bundleLabel)); await user.paste(addressEntry());
    await user.click(screen.getByRole("button", {name: copy.submit}));
    expect(await screen.findByText(errorCopy.invalid_input.title)).toBeInTheDocument();
  });
  it("starts empty and displays duplicate reuse evidence", async () => {
    const {user} = renderFeature(<SorobanAuthNonceExpiryAuditorPanel/>);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    await submit(user, duplicateBundle);
    expect(await screen.findByText(copy.reuseTitle)).toBeInTheDocument();
    expect(screen.getByText(/Entries: 1, 2/)).toBeInTheDocument();
    expect(screen.getByText(copy.limitation)).toBeInTheDocument();
  });
  it("renders expired entries and does not report equal nonces on different accounts as reuse", async () => {
    const {user} = renderFeature(<SorobanAuthNonceExpiryAuditorPanel/>);
    await submit(user, separateAccountsBundle, "100");
    expect(await screen.findByText(copy.noReuse)).toBeInTheDocument();
    expect(screen.getAllByText(copy.expired)).toHaveLength(2); // summary label + entry 2 (99 < 100)
    expect(screen.getByText(copy.sourceAccount)).toBeInTheDocument();
    expect(screen.getByText(copy.incompleteTitle)).toBeInTheDocument();
  });
  it("shows incomplete evidence without a ledger", async () => {
    const {user} = renderFeature(<SorobanAuthNonceExpiryAuditorPanel/>);
    await submit(user, addressEntry(), "");
    expect(await screen.findByText(copy.incompleteTitle)).toBeInTheDocument();
  });
  it("reports truncated XDR as malformed data", async () => {
    const {user} = renderFeature(<SorobanAuthNonceExpiryAuditorPanel/>);
    await submit(user, "AAAA");
    expect(await screen.findByText(errorCopy.malformed_data.title)).toBeInTheDocument();
  });
  it("invalidates an audit when the explicit network changes", async () => {
    const {user} = renderFeature(<SorobanAuthNonceExpiryAuditorPanel/>);
    await submit(user, addressEntry());
    await screen.findByText(copy.rowsTitle);
    await user.selectOptions(screen.getByLabelText(copy.networkLabel), "Public Global Stellar Network ; September 2015");
    expect(screen.queryByText(copy.rowsTitle)).not.toBeInTheDocument();
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });
  it("removes a rejected seed from the form and output", async () => {
    const {container, user} = renderFeature(<SorobanAuthNonceExpiryAuditorPanel/>);
    const seed = "S" + "A".repeat(55);
    await submit(user, seed);
    expect(await screen.findByText(errorCopy.invalid_input.title)).toBeInTheDocument();
    expect(container.textContent).not.toContain(seed);
    expect(screen.getByLabelText(copy.bundleLabel)).toHaveValue("");
  });
});
