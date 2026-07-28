import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandPalette } from "@/components/ui/CommandPalette";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

beforeEach(() => {
  mockPush.mockClear();
});

function setup(open = true) {
  const onClose = vi.fn();
  const result = render(<CommandPalette open={open} onClose={onClose} />);
  return { onClose, ...result };
}

describe("CommandPalette", () => {
  it("renders nothing when closed", () => {
    setup(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the dialog when open", () => {
    setup(true);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders all tools by default", () => {
    setup(true);
    expect(screen.getByText("Address Validator")).toBeInTheDocument();
    expect(screen.getByText("Balance Viewer")).toBeInTheDocument();
    expect(screen.getByText("Trustline Checker")).toBeInTheDocument();
    expect(screen.getByText("Payment QR Generator")).toBeInTheDocument();
    expect(screen.getByText("Transaction Lookup")).toBeInTheDocument();
    expect(screen.getByText("Freighter Connect")).toBeInTheDocument();
    expect(screen.getByText("Testnet Faucet Helper")).toBeInTheDocument();
  });

  it("filters tools by title", async () => {
    setup(true);
    const input = screen.getByRole("combobox");
    await userEvent.type(input, "balance");
    expect(screen.getByText("Balance Viewer")).toBeInTheDocument();
    expect(screen.queryByText("Address Validator")).not.toBeInTheDocument();
  });

  it("filters tools by description", async () => {
    setup(true);
    const input = screen.getByRole("combobox");
    await userEvent.type(input, "public keys");
    expect(screen.getByText("Address Validator")).toBeInTheDocument();
  });

  it("filters tools by category", async () => {
    setup(true);
    const input = screen.getByRole("combobox");
    await userEvent.type(input, "payments");
    expect(screen.getByText("Payment QR Generator")).toBeInTheDocument();
    expect(screen.queryByText("Address Validator")).not.toBeInTheDocument();
  });

  it("shows empty state when no results match", async () => {
    setup(true);
    const input = screen.getByRole("combobox");
    await userEvent.type(input, "xyznonexistent");
    expect(screen.getByText("No tools found")).toBeInTheDocument();
  });

  it("navigates to the selected tool on Enter", async () => {
    setup(true);
    const input = screen.getByRole("combobox");
    await userEvent.type(input, "{enter}");
    expect(mockPush).toHaveBeenCalledWith("/tools/address-validator");
  });

  it("closes on Escape", async () => {
    const { onClose } = setup(true);
    const input = screen.getByRole("combobox");
    await userEvent.type(input, "{escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on backdrop click", async () => {
    const { onClose } = setup(true);
    const backdrop = screen.getByRole("presentation").querySelector("[aria-hidden]")!;
    await userEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("moves selection with ArrowDown", async () => {
    setup(true);
    const input = screen.getByRole("combobox");
    await userEvent.type(input, "{arrowdown}");
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "false");
    expect(options[1]).toHaveAttribute("aria-selected", "true");
  });

  it("moves selection with ArrowUp", async () => {
    setup(true);
    screen.getByRole("combobox").focus();
    await userEvent.keyboard("{ArrowDown}{ArrowUp}");
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "true");
  });

  it("moves selection to first with Home", async () => {
    setup(true);
    screen.getByRole("combobox").focus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Home}");
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "true");
  });

  it("moves selection to last with End", async () => {
    setup(true);
    const input = screen.getByRole("combobox");
    input.focus();
    await userEvent.keyboard("{End}");
    const options = screen.getAllByRole("option");
    expect(options[options.length - 1]).toHaveAttribute("aria-selected", "true");
  });

  it("navigates on click", async () => {
    setup(true);
    await userEvent.click(screen.getByRole("option", { name: /Transaction Lookup/ }));
    expect(mockPush).toHaveBeenCalledWith("/tools/transaction-lookup");
  });

  it("restores focus on close", () => {
    const button = document.createElement("button");
    button.textContent = "Trigger";
    document.body.appendChild(button);
    button.focus();

    const onClose = vi.fn();
    const { rerender } = render(
      <CommandPalette open={true} onClose={onClose} />,
    );
    rerender(<CommandPalette open={false} onClose={onClose} />);

    expect(document.activeElement).toBe(button);
    document.body.removeChild(button);
  });
});
