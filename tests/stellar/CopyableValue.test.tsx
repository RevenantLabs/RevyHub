import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CopyableValue } from "@/components/stellar/CopyableValue";
import { RedactionProvider } from "@/components/stellar/RedactionProvider";

const FULL_VALUE = "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWXYZ2";
const STORAGE_KEY = "revyhubx-redaction";

function renderWithRedaction(redacted: boolean) {
  if (redacted) {
    window.localStorage.setItem(STORAGE_KEY, "true");
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return {
    ...render(
      <RedactionProvider>
        <CopyableValue label="Public key" value={FULL_VALUE} visible={6} />
      </RedactionProvider>
    )
  };
}

describe("CopyableValue", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows truncated text and exposes the full value for accessibility", () => {
    renderWithRedaction(false);

    expect(screen.getByText("GABCDE...VWXYZ2")).toBeInTheDocument();
    expect(screen.getByTitle(FULL_VALUE)).toHaveAttribute("title", FULL_VALUE);
    expect(screen.getByText(`Public key: ${FULL_VALUE}`)).toHaveClass("sr-only");
    expect(screen.getByRole("button", { name: "Copy Public key" })).toHaveAttribute(
      "aria-describedby"
    );
  });

  it("shows Copied feedback after a successful copy and resets after 1600ms", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });

    renderWithRedaction(false);

    await user.click(screen.getByRole("button", { name: "Copy Public key" }));

    expect(writeText).toHaveBeenCalledWith(FULL_VALUE);
    expect(screen.getByRole("button", { name: "Copy Public key" })).toHaveTextContent("Copied");

    await vi.advanceTimersByTimeAsync(1600);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Copy Public key" })).toHaveTextContent("Copy");
    });
  });

  it("handles clipboard rejection without an unhandled promise rejection", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
    const writeText = vi.fn().mockRejectedValue(new Error("Permission denied"));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });

    const unhandled: unknown[] = [];
    const onUnhandled = (reason: unknown) => {
      unhandled.push(reason);
    };
    process.on("unhandledRejection", onUnhandled);

    try {
      renderWithRedaction(false);
      await user.click(screen.getByRole("button", { name: "Copy Public key" }));
      await waitFor(() => {
        expect(writeText).toHaveBeenCalled();
      });
      expect(screen.getByRole("button", { name: "Copy Public key" })).toHaveTextContent("Copy");
      expect(unhandled).toHaveLength(0);
    } finally {
      process.off("unhandledRejection", onUnhandled);
    }
  });

  it("keeps independent feedback state across multiple instances", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });

    render(
      <RedactionProvider>
        <CopyableValue label="First" value="first-value" />
        <CopyableValue label="Second" value="second-value" />
      </RedactionProvider>
    );

    await user.click(screen.getByRole("button", { name: "Copy First" }));

    expect(screen.getByRole("button", { name: "Copy First" })).toHaveTextContent("Copied");
    expect(screen.getByRole("button", { name: "Copy Second" })).toHaveTextContent("Copy");
  });

  it("masks the value and announces redaction when redaction is active", () => {
    renderWithRedaction(true);

    expect(screen.getByText("G•••XYZ2")).toBeInTheDocument();
    expect(screen.getByText("Redacted Public key. Copying is not available while redaction is active.")).toHaveClass(
      "sr-only"
    );
    expect(screen.queryByTitle(FULL_VALUE)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copy Public key (confirmation required)" })
    ).toBeInTheDocument();
  });

  it("requires a second click to copy while redaction is active", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText }
    });

    renderWithRedaction(true);

    const button = screen.getByRole("button", {
      name: "Copy Public key (confirmation required)"
    });

    await user.click(button);
    expect(writeText).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Confirm copy of Public key" })
    ).toHaveTextContent("Sure?");

    await user.click(screen.getByRole("button", { name: "Confirm copy of Public key" }));
    expect(writeText).toHaveBeenCalledWith(FULL_VALUE);
    expect(screen.getByRole("button", { name: "Copy Public key (confirmation required)" })).toHaveTextContent(
      "Copied"
    );
  });

  it("resets the confirmation after 3 seconds", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) }
    });

    renderWithRedaction(true);

    await user.click(
      screen.getByRole("button", { name: "Copy Public key (confirmation required)" })
    );
    expect(
      screen.getByRole("button", { name: "Confirm copy of Public key" })
    ).toHaveTextContent("Sure?");

    await vi.advanceTimersByTimeAsync(3000);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Copy Public key (confirmation required)" })
      ).toHaveTextContent("Copy");
    });
  });

  it("cancels a pending confirmation with the Escape key", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) }
    });

    renderWithRedaction(true);

    await user.click(
      screen.getByRole("button", { name: "Copy Public key (confirmation required)" })
    );
    expect(
      screen.getByRole("button", { name: "Confirm copy of Public key" })
    ).toHaveTextContent("Sure?");

    fireEvent.keyDown(window, { key: "Escape" });

    expect(
      screen.getByRole("button", { name: "Copy Public key (confirmation required)" })
    ).toHaveTextContent("Copy");
  });
});
