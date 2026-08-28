import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { AssetMetadataPanel } from "@/features/asset-metadata/components/AssetMetadataPanel";
import { copy, errorCopy } from "@/features/asset-metadata/copy";
import { handlers, tomlHandler } from "@/features/asset-metadata/msw/handlers";
import {
  DOMAIN,
  tomlWithUnpinnedCurrency,
  tomlWithoutCurrencies
} from "@/features/asset-metadata/fixtures/assetMetadata.fixture";

const server = withMswHandlers(...handlers);

async function read(user: ReturnType<typeof renderFeature>["user"], value: string) {
  await user.type(screen.getByLabelText(copy.formLabel), value);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("AssetMetadataPanel", () => {
  it("shows the empty state first", () => {
    renderFeature(<AssetMetadataPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("lists every declared asset", async () => {
    const { user } = renderFeature(<AssetMetadataPanel />);
    await read(user, DOMAIN);

    expect(await screen.findByText(copy.resultTitle)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "USDC" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "EURC" })).toBeInTheDocument();
  });

  it("always states that the metadata is self-declared", async () => {
    const { user } = renderFeature(<AssetMetadataPanel />);
    await read(user, DOMAIN);

    expect(await screen.findByText(copy.trustWarningTitle)).toBeInTheDocument();
  });

  it("flags an asset that declares no issuer", async () => {
    server.use(tomlHandler(tomlWithUnpinnedCurrency));
    const { user } = renderFeature(<AssetMetadataPanel />);
    await read(user, DOMAIN);

    expect(await screen.findByText(copy.unpinnedLabel)).toBeInTheDocument();
  });

  it("separates 'no assets declared' from an error", async () => {
    server.use(tomlHandler(tomlWithoutCurrencies));
    const { user } = renderFeature(<AssetMetadataPanel />);
    await read(user, DOMAIN);

    expect(await screen.findByText(copy.noCurrenciesTitle)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("refuses an http domain without making a request", async () => {
    const { user } = renderFeature(<AssetMetadataPanel />);
    await read(user, `http://${DOMAIN}`);

    expect(await screen.findByText(errorCopy.insecure_scheme.title)).toBeInTheDocument();
  });

  it("shows where the answer came from", async () => {
    const { user } = renderFeature(<AssetMetadataPanel />);
    await read(user, DOMAIN);

    expect(await screen.findByText(copy.provenanceTitle)).toBeInTheDocument();
    expect(screen.getByText(`https://${DOMAIN}/.well-known/stellar.toml`)).toBeInTheDocument();
  });
});
