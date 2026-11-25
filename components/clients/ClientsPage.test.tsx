import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach } from "vitest";
import { createElement, forwardRef } from "react";
import type { HTMLAttributes, Ref } from "react";
import gsap from "gsap";

// ── Mock GSAP ──────────────────────────────────────────────────────────────
vi.mock("gsap", () => ({
  default: {
    to: vi.fn(),
    from: vi.fn(),
    set: vi.fn(),
  },
}));

// ── Mock motion/react ──────────────────────────────────────────────────────
function makeMotionElement(tag: string) {
  type MotionProps = HTMLAttributes<HTMLElement> & {
    initial?: unknown;
    animate?: unknown;
    transition?: unknown;
    whileHover?: unknown;
    whileInView?: unknown;
    viewport?: unknown;
  };
  const Component = forwardRef(
    (
      {
        children,
        initial,
        animate,
        transition,
        whileHover,
        whileInView,
        viewport,
        ...rest
      }: MotionProps,
      ref: Ref<HTMLElement>,
    ) => {
      void initial;
      void animate;
      void transition;
      void whileHover;
      void whileInView;
      void viewport;
      return createElement(tag, { ...rest, ref }, children);
    },
  );
  Component.displayName = `motion.${tag}`;
  return Component;
}

vi.mock("motion/react", () => {
  const cache: Record<string, ReturnType<typeof makeMotionElement>> = {};
  return {
    motion: new Proxy(cache, {
      get: (target, tag: string) => {
        if (!target[tag]) {
          target[tag] = makeMotionElement(tag);
        }
        return target[tag];
      },
    }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
    useTransform: () => 0,
    useMotionValue: () => ({ get: () => 0, set: vi.fn() }),
    useSpring: () => ({ get: () => 0 }),
  };
});

// ── Imports after mocks ────────────────────────────────────────────────────
import ClientesPage from "@/app/clientes/page";
import ClientsHero from "@/components/clients/ClientsHero";
import ClientStyles from "@/components/clients/ClientStyles";

describe("ClientesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the full page without crashing", () => {
    render(<ClientesPage />);
    expect(
      screen.getByRole("heading", { name: /sua próxima obra-prima começa aqui\./i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /descubra seu estilo/i }),
    ).toBeInTheDocument();
  });

  test("ClientsHero renders the main heading and CTA buttons", () => {
    render(<ClientsHero />);
    expect(
      screen.getByRole("heading", { level: 1, name: /sua próxima obra-prima começa aqui\./i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /encontrar tatuadores/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /ver estilos/i }),
    ).toHaveAttribute("href", "#estilos");
  });

  test("ClientStyles renders all 5 tattoo style labels and animates on hover", () => {
    render(<ClientStyles />);
    const styles = ["Realismo", "Old School", "Blackwork", "Aquarela", "Fine Line"];
    for (const style of styles) {
      expect(screen.getByText(style)).toBeInTheDocument();
    }

    const oldSchoolImg = screen.getByAltText("Old School");
    expect(oldSchoolImg).toHaveClass("grayscale");

    fireEvent.mouseEnter(oldSchoolImg.closest("div.cursor-pointer")!);
    expect(oldSchoolImg).toHaveClass("grayscale-0");
    expect(gsap.to).toHaveBeenCalled();
  });
});
