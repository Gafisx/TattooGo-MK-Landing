import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import TattooMenu from "./TattooMenu";

describe("TattooMenu", () => {
  test("renders the main trigger button", () => {
    render(<TattooMenu />);
    expect(
      screen.getByRole("button", { name: /abrir menu/i })
    ).toBeInTheDocument();
  });

  test("expands the menu when the trigger button is clicked", () => {
    render(<TattooMenu />);
    const trigger = screen.getByRole("button", { name: /abrir menu/i });
    fireEvent.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /fechar menu/i })
    ).toBeInTheDocument();
  });
});
