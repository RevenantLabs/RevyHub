import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandPalette } from "../../components/ui/CommandPalette";
import { useRouter } from "next/navigation";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock scrollIntoView to prevent jsdom errors
Element.prototype.scrollIntoView = vi.fn();

describe("CommandPalette", () => {
  const pushMock = vi.fn();

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({ push: pushMock } as unknown as ReturnType<typeof useRouter>);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("opens via custom event", async () => {
    render(<CommandPalette />);
    expect(screen.queryByRole("dialog")).toBeNull();

    window.dispatchEvent(new CustomEvent("open-command-palette"));

    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("opens and closes via Cmd+K and Escape", async () => {
    render(<CommandPalette />);
    const user = userEvent.setup();

    // Open
    await user.keyboard("{Meta>}{k}{/Meta}");
    expect(screen.getByRole("dialog")).toBeDefined();

    // Close
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("focuses input on open", async () => {
    render(<CommandPalette />);
    window.dispatchEvent(new CustomEvent("open-command-palette"));

    const input = screen.getByPlaceholderText(/search/i);
    await waitFor(() => {
      expect(document.activeElement).toBe(input);
    });
  });

  it("filters tools based on query", async () => {
    render(<CommandPalette />);
    const user = userEvent.setup();
    window.dispatchEvent(new CustomEvent("open-command-palette"));

    const input = screen.getByPlaceholderText(/search/i);

    // Default shows multiple tools (Address Validator is one)
    expect(screen.getByText("Address Validator")).toBeDefined();

    // Search for a specific tool
    await user.type(input, "balance");
    expect(screen.queryByText("Address Validator")).toBeNull();
    expect(screen.getByText("Balance Viewer")).toBeDefined();
  });

  it("shows empty state when no tools match", async () => {
    render(<CommandPalette />);
    const user = userEvent.setup();
    window.dispatchEvent(new CustomEvent("open-command-palette"));

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, "NonExistentToolXYZ");

    expect(screen.getByText("No tools found")).toBeDefined();
  });

  it("navigates options via keyboard and selects via Enter", async () => {
    render(<CommandPalette />);
    const user = userEvent.setup();
    window.dispatchEvent(new CustomEvent("open-command-palette"));

    // Navigate down
    await user.keyboard("{ArrowDown}");
    // Navigate down again
    await user.keyboard("{ArrowDown}");
    // Navigate up
    await user.keyboard("{ArrowUp}");

    // Hit enter
    await user.keyboard("{Enter}");

    // The first item is Address Validator (index 0).
    // Down (idx 1), Down (idx 2), Up (idx 1).
    // So it should select index 1 (Balance Viewer)
    expect(pushMock).toHaveBeenCalledWith("/tools/balance-viewer");

    // Verify dialog closed
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("ignores shortcut if typing in input", async () => {
    const TestComponent = () => (
      <>
        <input type="text" data-testid="external-input" />
        <CommandPalette />
      </>
    );
    render(<TestComponent />);
    const user = userEvent.setup();

    const input = screen.getByTestId("external-input");
    input.focus();

    // Press Cmd+K
    await user.keyboard("{Meta>}{k}{/Meta}");

    // Dialog should NOT be open
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
