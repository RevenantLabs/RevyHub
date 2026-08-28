import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { FederationResolverPanel } from "@/features/federation-resolver/components/FederationResolverPanel";
import { copy, errorCopy } from "@/features/federation-resolver/copy";
import {
  federationHandler,
  handlers,
  tomlHandler
} from "@/features/federation-resolver/msw/handlers";
import {
  DOMAIN,
  recordWithoutMemo,
  tomlWithHttpFederation
} from "@/features/federation-resolver/fixtures/federationResolver.fixture";

const server = withMswHandlers(...handlers);

async function resolve(user: ReturnType<typeof renderFeature>["user"], value: string) {
  await user.type(screen.getByLabelText(copy.formLabel), value);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("FederationResolverPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<FederationResolverPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows the account and warns that a memo is required", async () => {
    const { user } = renderFeature(<FederationResolverPanel />);
    await resolve(user, `alice*${DOMAIN}`);

    expect(await screen.findByText(copy.memoWarningTitle)).toBeInTheDocument();
    expect(screen.getByText("12345 (ID)")).toBeInTheDocument();
  });

  it("says plainly when no memo is required", async () => {
    server.use(federationHandler(recordWithoutMemo));
    const { user } = renderFeature(<FederationResolverPanel />);
    await resolve(user, `bob*${DOMAIN}`);

    expect(await screen.findByText(copy.noMemoTitle)).toBeInTheDocument();
  });

  it("shows where the answer came from", async () => {
    const { user } = renderFeature(<FederationResolverPanel />);
    await resolve(user, `alice*${DOMAIN}`);

    expect(await screen.findByText(copy.provenanceTitle)).toBeInTheDocument();
    expect(screen.getByText("federation.example.com")).toBeInTheDocument();
  });

  it("refuses a plaintext federation server", async () => {
    server.use(tomlHandler(tomlWithHttpFederation));
    const { user } = renderFeature(<FederationResolverPanel />);
    await resolve(user, `alice*${DOMAIN}`);

    expect(await screen.findByText(errorCopy.https_required.title)).toBeInTheDocument();
  });

  it("explains bad syntax without making a request", async () => {
    const { user } = renderFeature(<FederationResolverPanel />);
    await resolve(user, "not-an-address");

    expect(await screen.findByText(errorCopy.invalid_syntax.title)).toBeInTheDocument();
  });
});
