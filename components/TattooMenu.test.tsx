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

  test("ancora o gatilho na base da viewport no mobile", () => {
    const { container } = render(<TattooMenu />);
    const root = container.firstElementChild as HTMLElement;

    // Mesma linha de base do controle de áudio (token com safe-area).
    expect(root.className).toContain("bottom-[var(--tattoo-float-control-offset)]");
    expect(root.className).toContain("right-6");
    // Desktop preservado: volta ao respiro original a partir de sm.
    expect(root.className).toContain("sm:bottom-6");
    expect(root.className).not.toContain("bottom-24");
  });

  test("abre o leque de baixo para cima, acima do gatilho", () => {
    render(<TattooMenu />);
    const trigger = screen.getByRole("button", { name: /abrir menu/i });
    fireEvent.click(trigger);

    const menu = screen.getByRole("menu");
    // Coluna alinhada à direita: os itens empilham para cima do gatilho.
    expect(menu.parentElement?.className).toContain("flex-col");
    expect(menu.parentElement?.className).toContain("items-end");
    expect(
      menu.compareDocumentPosition(trigger) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getAllByRole("menuitem")).toHaveLength(4);
  });
});
