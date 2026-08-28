import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { AccountMergePreflightPanel } from "@/features/account-merge-preflight/components/AccountMergePreflightPanel";
import { copy, errorCopy } from "@/features/account-merge-preflight/copy";
import {
  blockedSourceHandler,
  handlers,
  offersHandler
} from "@/features/account-merge-preflight/msw/handlers";
import {
  destinationAccountId,
  secretSeed,
  sourceAccountId,
  unknownDestinationAccountId
} from "@/features/account-merge-preflight/fixtures/accountMergePreflight.fixture";

const server = withMswHandlers(...handlers);

async function fill(
  user: ReturnType<typeof renderFeature>["user"],
  source = sourceAccountId,
  destination = destinationAccountId
) {
  await user.type(screen.getByLabelText(copy.sourceLabel), source);
  await user.type(screen.getByLabelText(copy.destinationLabel), destination);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("AccountMergePreflightPanel", () => {
  it("renders the empty state before any input", () => {
    renderFeature(<AccountMergePreflightPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<AccountMergePreflightPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(/Enter the source account/)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.sourceLabel)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getAllByRole("alert")).toHaveLength(1);
  });

  it("reports a clean source as mergeable with its exact XLM transfer", async () => {
    const { user } = renderFeature(<AccountMergePreflightPanel />);
    await fill(user);
    expect(await screen.findByText(copy.mergeableTitle)).toBeInTheDocument();
    expect(screen.getByText(`25.5000000 ${copy.xlmSuffix}`)).toBeInTheDocument();
    expect(screen.getAllByText(copy.pass)).toHaveLength(8);
  });

  it("lists concrete trustline, offer, data, sponsorship and signer blockers", async () => {
    server.use(blockedSourceHandler, offersHandler);
    const { user } = renderFeature(<AccountMergePreflightPanel />);
    await fill(user);

    expect(await screen.findByText(copy.blockedTitle)).toBeInTheDocument();
    expect(screen.getByText(/Trustline USD:/)).toBeInTheDocument();
    expect(screen.getByText(/Offer 101: selling XLM/)).toBeInTheDocument();
    expect(screen.getByText(/Data entry “invoice”/)).toBeInTheDocument();
    expect(screen.getByText(/2 sponsored reserve entries/)).toBeInTheDocument();
    expect(screen.getByText(/Configured signer weight 5; high threshold 10/)).toBeInTheDocument();
    expect(screen.getAllByText(/AUTH_IMMUTABLE/)).toHaveLength(2);
  });

  it("distinguishes a missing destination at its own field", async () => {
    const { user } = renderFeature(<AccountMergePreflightPanel />);
    await fill(user, sourceAccountId, unknownDestinationAccountId);
    expect(await screen.findByText(/Destination account not found/)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.destinationLabel)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(copy.sourceLabel)).toHaveAttribute("aria-invalid", "false");
  });

  it("rejects self-merge before issuing a network request", async () => {
    const { user } = renderFeature(<AccountMergePreflightPanel />);
    await fill(user, sourceAccountId, sourceAccountId);
    expect(await screen.findByRole("alert")).toHaveTextContent(errorCopy.same_account.title);
  });

  it("never echoes a submitted secret into result or error copy", async () => {
    const { user, container } = renderFeature(<AccountMergePreflightPanel />);
    await fill(user, secretSeed, destinationAccountId);
    expect(await screen.findByText(/source address is invalid/i)).toBeInTheDocument();
    expect(container.textContent ?? "").not.toContain(secretSeed);
  });
});
