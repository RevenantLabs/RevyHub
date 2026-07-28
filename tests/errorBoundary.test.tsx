import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ErrorBoundary from "@/app/error";

describe("ErrorBoundary", () => {
  const error = new Error("Test rendering failure");
  const reset = vi.fn();

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders a friendly fallback instead of a blank page", () => {
    render(<ErrorBoundary error={error} reset={reset} />);

    expect(screen.getByText("Something went wrong")).toBeTruthy();
    expect(
      screen.getByText(
        "An unexpected error occurred while loading this page. Please try again or return to the dashboard."
      )
    ).toBeTruthy();
  });

  it("does not show raw stack traces", () => {
    render(<ErrorBoundary error={error} reset={reset} />);

    expect(screen.queryByText(/Test rendering failure/)).toBeNull();
    expect(screen.queryByText(/at /)).toBeNull();
  });

  it("offers a retry button that calls reset", () => {
    render(<ErrorBoundary error={error} reset={reset} />);

    const retryButton = screen.getByText("Try again");
    retryButton.click();
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("offers a link to the dashboard", () => {
    render(<ErrorBoundary error={error} reset={reset} />);

    const dashboardLink = screen.getByText("Go to dashboard");
    expect(dashboardLink.closest("a")?.getAttribute("href")).toBe("/");
  });
});