import React from "react";
import { describe, expect, it } from "vitest";
import { renderFeature, screen, waitFor } from "@/core/testing/render";
import { AccountDataEntriesPanel } from "../components/AccountDataEntriesPanel";
import { Keypair } from "@stellar/stellar-sdk";
import { withMswHandlers, http, HttpResponse } from "@/core/testing/msw";

const server = withMswHandlers();

describe("AccountDataEntriesPanel", () => {
  it("renders form", () => {
    renderFeature(<AccountDataEntriesPanel />);
    expect(screen.getByTestId("account-data-entries-form")).toBeInTheDocument();
  });

  it("shows empty state when no entries", async () => {
    const pub = Keypair.random().publicKey();
    server.use(http.get(`*/accounts/${pub}`, () => HttpResponse.json({ data: {} })));
    const { user } = renderFeature(<AccountDataEntriesPanel />);
    
    await user.type(screen.getByLabelText(/Account ID/i), pub);
    await user.click(screen.getByRole("button", { name: /View Data Entries/i }));
    
    await waitFor(() => {
      expect(screen.getByTestId("account-data-entries-empty-state")).toBeInTheDocument();
    });
  });

  it("shows results when entries exist", async () => {
    const pub = Keypair.random().publicKey();
    const b64 = Buffer.from("hello").toString("base64");
    server.use(http.get(`*/accounts/${pub}`, () => HttpResponse.json({ data: { "mykey": b64 } })));
    const { user } = renderFeature(<AccountDataEntriesPanel />);
    
    await user.type(screen.getByLabelText(/Account ID/i), pub);
    await user.click(screen.getByRole("button", { name: /View Data Entries/i }));
    
    await waitFor(() => {
      expect(screen.getByTestId("account-data-entries-result")).toBeInTheDocument();
      expect(screen.getByText("mykey")).toBeInTheDocument();
      expect(screen.getByText("hello")).toBeInTheDocument();
    });
  });
});
