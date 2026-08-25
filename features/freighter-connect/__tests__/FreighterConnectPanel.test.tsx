import { afterEach, describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { FreighterConnectPanel } from "@/features/freighter-connect/components/FreighterConnectPanel";
import { copy, errorCopy } from "@/features/freighter-connect/copy";
import {
  connectedApi,
  lockedApi,
  mainnetApi
} from "@/features/freighter-connect/fixtures/freighterConnect.fixture";
import type { FreighterApi } from "@/features/freighter-connect/types";

function install(api: FreighterApi | undefined) {
  if (api) {
    (window as unknown as { freighterApi?: FreighterApi }).freighterApi = api;
  } else {
    delete (window as unknown as { freighterApi?: FreighterApi }).freighterApi;
  }
}

afterEach(() => install(undefined));

describe("FreighterConnectPanel", () => {
  it("offers an install link when Freighter is absent", async () => {
    install(undefined);
    renderFeature(<FreighterConnectPanel />);

    expect(await screen.findByText(errorCopy.not_installed.title)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: copy.installLink })).toBeInTheDocument();
  });

  it("shows the wallet public key and network once connected", async () => {
    install(connectedApi);
    renderFeature(<FreighterConnectPanel />, { network: "testnet" });

    expect(await screen.findByText(copy.detectedTitle)).toBeInTheDocument();
    // Both the wallet row and the page row report Testnet when they agree.
    expect(screen.getAllByText("Testnet")).toHaveLength(2);
    expect(screen.getByText(copy.labelPublicKey)).toBeInTheDocument();
  });

  it("warns when the wallet and the page are on different networks", async () => {
    install(mainnetApi);
    renderFeature(<FreighterConnectPanel />, { network: "testnet" });

    expect(await screen.findByText(copy.mismatchTitle)).toBeInTheDocument();
  });

  it("does not warn when both are on the same network", async () => {
    install(connectedApi);
    renderFeature(<FreighterConnectPanel />, { network: "testnet" });

    await screen.findByText(copy.detectedTitle);
    expect(screen.queryByText(copy.mismatchTitle)).not.toBeInTheDocument();
  });

  it("offers a connect action when access has not been granted", async () => {
    install(lockedApi);
    renderFeature(<FreighterConnectPanel />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: copy.connect })).toBeInTheDocument()
    );
    expect(screen.getByText(copy.notAllowedTitle)).toBeInTheDocument();
  });
});
