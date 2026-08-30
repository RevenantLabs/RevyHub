import { describe, expect, it } from "vitest";
import { renderFeature, screen } from "@/core/testing/render";
import { withMswHandlers } from "@/core/testing/msw";
import { resetHorizonClients } from "@/core/horizon/client";
import { OperationBrowserPanel } from "@/features/operation-browser/components/OperationBrowserPanel";
import { copy, errorCopy } from "@/features/operation-browser/copy";
import { handlers } from "@/features/operation-browser/msw/handlers";
import {
  accountId,
  secretSeed
} from "@/features/operation-browser/fixtures/operationBrowser.fixture";

const server = withMswHandlers(...handlers);

describe("OperationBrowserPanel", () => {
  it("shows the empty state before any input", () => {
    renderFeature(<OperationBrowserPanel />);
    expect(screen.getByText(copy.emptyTitle)).toBeInTheDocument();
  });

  it("shows a validation error when submitted empty", async () => {
    const { user } = renderFeature(<OperationBrowserPanel />);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    expect(await screen.findByText(errorCopy.empty_input.title)).toBeInTheDocument();
  });

  it("renders operations with transaction hashes", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<OperationBrowserPanel />);
    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByRole("heading", { name: copy.resultTitle })).toBeInTheDocument();
    expect(screen.getAllByText("Change trust").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Manage sell offer").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: copy.loadOlder })).toBeEnabled();
  });

  it("filters loaded operations by type", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<OperationBrowserPanel />);
    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByRole("heading", { name: copy.resultTitle });

    await user.selectOptions(screen.getByLabelText(copy.filterLabel), "change_trust");
    expect(screen.getByText(/1 of 20 loaded operations match Change trust/i)).toBeInTheDocument();
    expect(screen.getByText("Limit")).toBeInTheDocument();
  });

  it("marks the account field invalid for a bad address", async () => {
    const { user } = renderFeature(<OperationBrowserPanel />);
    await user.type(screen.getByLabelText(copy.formLabel), "bad");
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.invalid_address.title)).toBeInTheDocument();
    expect(screen.getByLabelText(copy.formLabel)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getAllByRole("alert")).toHaveLength(1);
  });

  it("does not echo a submitted secret seed", async () => {
    const { user, container } = renderFeature(<OperationBrowserPanel />);
    await user.type(screen.getByLabelText(copy.formLabel), secretSeed);
    await user.click(screen.getByRole("button", { name: copy.submit }));

    expect(await screen.findByText(errorCopy.invalid_address.title)).toBeInTheDocument();
    expect(container.textContent ?? "").not.toContain(secretSeed);
  });

  it("distinguishes failed operations after loading more", async () => {
    resetHorizonClients();
    const { user } = renderFeature(<OperationBrowserPanel />);
    await user.type(screen.getByLabelText(copy.formLabel), accountId);
    await user.click(screen.getByRole("button", { name: copy.submit }));
    await screen.findByText(copy.loadOlder);
    await user.click(screen.getByRole("button", { name: copy.loadOlder }));

    expect(await screen.findByText(copy.failedOperation)).toBeInTheDocument();
  });
});
