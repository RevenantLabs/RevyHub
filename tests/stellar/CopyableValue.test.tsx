import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CopyableValue } from "@/components/stellar/CopyableValue";

const FULL_VALUE = "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWXYZ2";

describe("CopyableValue", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows truncated text and exposes the full value for accessibility", () => {
    render(<CopyableValue label="Public key" value={FULL_VALUE} visible={6} />);

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

    render(<CopyableValue label="Memo" value="demo-memo" />);

    await user.click(screen.getByRole("button", { name: "Copy Memo" }));

    expect(writeText).toHaveBeenCalledWith("demo-memo");
    expect(screen.getByRole("button", { name: "Copy Memo" })).toHaveTextContent("Copied");

    await vi.advanceTimersByTimeAsync(1600);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Copy Memo" })).toHaveTextContent("Copy");
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
      render(<CopyableValue label="Address" value="GCUTOFF" />);
      await user.click(screen.getByRole("button", { name: "Copy Address" }));
      await waitFor(() => {
        expect(writeText).toHaveBeenCalled();
      });
      expect(screen.getByRole("button", { name: "Copy Address" })).toHaveTextContent("Copy");
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
      <>
        <CopyableValue label="First" value="first-value" />
        <CopyableValue label="Second" value="second-value" />
      </>
    );

    await user.click(screen.getByRole("button", { name: "Copy First" }));

    expect(screen.getByRole("button", { name: "Copy First" })).toHaveTextContent("Copied");
    expect(screen.getByRole("button", { name: "Copy Second" })).toHaveTextContent("Copy");
  });
});
