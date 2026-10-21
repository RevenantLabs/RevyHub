import { describe, expect, it } from "vitest";
import { fireEvent } from "@testing-library/react";
import { renderFeature, screen } from "@/core/testing/render";
import { delay, http, HttpResponse, withMswHandlers } from "@/core/testing/msw";
import { Sep38QuoteViewerPanel } from "@/features/sep38-quote-viewer/components/Sep38QuoteViewerPanel";
import { copy, errorCopy, fieldErrorCopy } from "@/features/sep38-quote-viewer/copy";
import {
  EXPIRES_AT,
  INDICATIVE_PRICE,
  OFF_CHAIN_ASSET,
  ON_CHAIN_ASSET,
  SELL_AMOUNT,
  TOML_URL,
  secretSeed,
  tomlDocument
} from "@/features/sep38-quote-viewer/fixtures/sep38QuoteViewer.fixture";
import {
  UNSUPPORTED_AMOUNT,
  UNSUPPORTED_OFF_CHAIN
} from "@/features/sep38-quote-viewer/fixtures/unsupported-pair.fixture";
import { handlers } from "@/features/sep38-quote-viewer/msw/handlers";

const server = withMswHandlers(...handlers);

function setField(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

async function submitNormal(user: ReturnType<typeof renderFeature>["user"]) {
  setField(copy.homeDomainLabel, "quote.example");
  setField(copy.offChainLabel, OFF_CHAIN_ASSET);
  setField(copy.onChainLabel, ON_CHAIN_ASSET);
  setField(copy.amountLabel, SELL_AMOUNT);
  await user.click(screen.getByRole("button", { name: copy.submit }));
}

describe("Sep38QuoteViewerPanel", () => {
  it("renders the empty state and stacks the form for a narrow viewport", () => {
    renderFeature(<Sep38QuoteViewerPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
    const form = screen.getByRole("form", { name: copy.formName });
    expect(form).toHaveClass("grid-cols-1");
    expect(form).toHaveClass("sm:grid-cols-2");
    expect(form).toHaveClass("w-full");
  });

  it("shows a field error for an empty domain and does not echo a secret key", async () => {
    const { user } = renderFeature(<Sep38QuoteViewerPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByRole("alert")).toHaveTextContent(fieldErrorCopy.home_domain);

    setField(copy.onChainLabel, secretSeed);
    expect(screen.getByLabelText(copy.onChainLabel)).toHaveValue("");
    expect(document.body.textContent).not.toContain(secretSeed);
  });

  it("shows the indicative price, both assets, and the expiration", async () => {
    const { user } = renderFeature(<Sep38QuoteViewerPanel />);
    await submitNormal(user);
    expect(await screen.findByText(copy.resultTitle)).toBeInTheDocument();
    expect(screen.getByText(copy.indicativeTitle)).toBeInTheDocument();
    expect(screen.getByText(INDICATIVE_PRICE)).toBeInTheDocument();
    expect(screen.getByText(OFF_CHAIN_ASSET)).toBeInTheDocument();
    expect(screen.getByText(ON_CHAIN_ASSET)).toBeInTheDocument();
    expect(screen.getByText("2026-06-01 15:04:05 UTC")).toBeInTheDocument();
    expect(EXPIRES_AT.startsWith("2026-06-01")).toBe(true);
    expect(screen.queryByText(errorCopy.request_failed.title)).not.toBeInTheDocument();
  });

  it("shows loading and then the unsupported-pair outcome", async () => {
    server.use(
      http.get(TOML_URL, async () => {
        await delay(80);
        return HttpResponse.text(tomlDocument);
      })
    );
    const { user } = renderFeature(<Sep38QuoteViewerPanel />);
    setField(copy.homeDomainLabel, "quote.example");
    setField(copy.offChainLabel, UNSUPPORTED_OFF_CHAIN);
    setField(copy.onChainLabel, ON_CHAIN_ASSET);
    setField(copy.amountLabel, UNSUPPORTED_AMOUNT);
    const pending = user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(copy.loadingTitle)).toBeInTheDocument();
    await pending;
    expect(await screen.findByRole("alert")).toHaveTextContent(errorCopy.unsupported_pair.title);
    expect(screen.queryByText(errorCopy.request_failed.title)).not.toBeInTheDocument();
    expect(screen.queryByText(copy.resultTitle)).not.toBeInTheDocument();
  });
});
