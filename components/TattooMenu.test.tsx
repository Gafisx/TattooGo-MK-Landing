import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import TattooMenu from "./TattooMenu";

// next/navigation mock
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// next/link mock — renderiza um <a> simples
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => {
    // Remove transitionTypes que não existe em <a>
    const { transitionTypes: _t, ...aProps } = rest as {
      transitionTypes?: unknown;
      [key: string]: unknown;
    };
    void _t;
    return (
      <a href={href} {...aProps}>
        {children}
      </a>
    );
  },
}));

// next-themes mock
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "dark", resolvedTheme: "dark", setTheme: vi.fn() }),
}));

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
