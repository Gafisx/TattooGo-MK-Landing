import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

// motion/react mock — o happy-dom não avança quadros de animação, então o stub
// remove as props de mola e deixa o AnimatePresence montar/desmontar na hora.
vi.mock("motion/react", async () => {
  const React = await import("react");
  type StubProps = Record<string, unknown> & { children?: React.ReactNode };
  const MOTION_ONLY_PROPS = [
    "initial",
    "animate",
    "exit",
    "transition",
    "whileTap",
    "whileHover",
    "layout",
    "layoutId",
    "variants",
  ];
  const cache = new Map<string, React.ComponentType<StubProps>>();

  const componentFor = (tag: string) => {
    const cached = cache.get(tag);
    if (cached) return cached;

    const Stub = React.forwardRef<HTMLElement, StubProps>(
      function MotionStub(props, ref) {
        const domProps: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(props)) {
          if (!MOTION_ONLY_PROPS.includes(key)) domProps[key] = value;
        }
        return React.createElement(tag, { ...domProps, ref });
      },
    );
    cache.set(tag, Stub);
    return Stub;
  };

  return {
    motion: new Proxy({} as Record<string, React.ComponentType<StubProps>>, {
      get: (_target, key: string) => componentFor(key),
    }),
    AnimatePresence: ({ children }: StubProps) =>
      React.createElement(React.Fragment, null, children),
  };
});

// next-themes mock
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "dark", resolvedTheme: "dark", setTheme: vi.fn() }),
}));

describe("TattooMenu", () => {
  test("renders the main trigger button", () => {
    render(<TattooMenu />);
    expect(screen.getByRole("button", { name: /abrir menu/i })).toBeInTheDocument();
  });

  test("expands the menu when the trigger button is clicked", () => {
    render(<TattooMenu />);
    const trigger = screen.getByRole("button", { name: /abrir menu/i });
    fireEvent.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /fechar menu/i })).toBeInTheDocument();
  });

  test("expõe as cinco ações alinhadas às rotas e seções existentes", () => {
    render(<TattooMenu />);
    fireEvent.click(screen.getByRole("button", { name: /abrir menu/i }));

    const items = screen.getAllByRole("menuitem");
    expect(items.map((item) => item.getAttribute("aria-label"))).toEqual([
      "Baixar App",
      "Como Funciona",
      "Ajuda",
      "Feedback",
      "Termos",
    ]);
    expect(items.map((item) => item.getAttribute("href"))).toEqual([
      "/download",
      "/#split-client-title",
      "/#security",
      "/#waitlist",
      "/#legal",
    ]);
  });

  test("botão inteligente revela os nomes completos dos itens", () => {
    render(<TattooMenu />);
    fireEvent.click(screen.getByRole("button", { name: /abrir menu/i }));

    const panel = screen.getByRole("menu");
    expect(panel).toHaveAttribute("data-expanded", "false");

    const toggle = screen.getByRole("button", {
      name: /mostrar nomes das ações rápidas/i,
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);
    expect(screen.getByRole("menu")).toHaveAttribute("data-expanded", "true");
    expect(
      screen.getByRole("button", { name: /ocultar nomes das ações rápidas/i }),
    ).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(
      screen.getByRole("button", { name: /ocultar nomes das ações rápidas/i }),
    );
    expect(screen.getByRole("menu")).toHaveAttribute("data-expanded", "false");
  });

  test("Escape fecha o menu e devolve o foco ao gatilho", async () => {
    render(<TattooMenu />);
    const trigger = screen.getByRole("button", { name: /abrir menu/i });
    fireEvent.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    // O AnimatePresence mantém o nó até a animação de saída terminar.
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });

  test("clique fora recolhe o conjunto e descarta a expansão", async () => {
    render(<TattooMenu />);
    fireEvent.click(screen.getByRole("button", { name: /abrir menu/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /mostrar nomes das ações rápidas/i }),
    );

    fireEvent.mouseDown(document.body);

    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: /abrir menu/i }));
    expect(screen.getByRole("menu")).toHaveAttribute("data-expanded", "false");
  });
});
