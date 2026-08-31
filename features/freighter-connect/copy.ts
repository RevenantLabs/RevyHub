import type { FreighterErrorCode } from "@/features/freighter-connect/types";

export const copy = {
  refresh: "Check again",
  connect: "Connect Freighter",
  checking: "Checking...",
  emptyTitle: "Looking for Freighter",
  emptyDescription:
    "This page reads the Freighter extension if it is installed. It never asks for a secret key and never signs anything.",
  detectedTitle: "Freighter is connected",
  notAllowedTitle: "Freighter is installed but has not granted access",
  notAllowedDescription:
    "Connect the wallet to let this page read its public key and selected network.",
  resultTitle: "Wallet",
  mismatchTitle: "The wallet and this page are on different networks",
  mismatchDescription:
    "Anything you build here would target a different network than the wallet would sign for. Change the network in the header, or switch it inside Freighter.",
  installLink: "Install Freighter",
  labelPublicKey: "Public key",
  labelWalletNetwork: "Wallet network",
  labelAppNetwork: "This page"
} as const;

export const errorCopy: Record<FreighterErrorCode, { title: string; description: string }> = {
  not_installed: {
    title: "Freighter is not installed in this browser",
    description:
      "Freighter is a browser extension for Stellar. Install it, then use Check again — no page reload is needed."
  },
  not_allowed: {
    title: "Freighter did not grant access",
    description:
      "The connection request was dismissed or refused. Open the extension and approve this site, then try again."
  },
  api_incomplete: {
    title: "This Freighter version exposes a different API",
    description:
      "The extension was detected but does not provide the methods this page needs. Updating Freighter usually resolves it."
  },
  read_failed: {
    title: "Could not read the wallet",
    description: "Freighter responded with an error. Open the extension, unlock it and try again."
  }
};
