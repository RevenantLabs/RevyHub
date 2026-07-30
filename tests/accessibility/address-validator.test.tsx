import "../mocks.tsx";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import AddressValidatorPage from "@/app/tools/address-validator/page";

describe("Address Validator tool", () => {
  it("has no axe violations on empty form state", async () => {
    const { container } = render(<AddressValidatorPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no axe violations on validation error state", async () => {
    const { container } = render(<AddressValidatorPage />);
    const input = screen.getByPlaceholderText("G...");
    await userEvent.type(input, "INVALID_ADDRESS");
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no axe violations on success state", async () => {
    const { container } = render(<AddressValidatorPage />);
    const input = screen.getByPlaceholderText("G...");
    await userEvent.type(input, "GAIUIZNW34OGCLZQJ3H6VCV6CR3B6FTUV4I7WONY5FY7B6YZU7P7HJHJ");
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
