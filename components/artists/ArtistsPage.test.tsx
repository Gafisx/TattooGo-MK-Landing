import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { createElement, forwardRef } from "react";
import type { HTMLAttributes, ReactNode, Ref } from "react";

// ── Mock motion/react ──────────────────────────────────────────────────────
function makeMotionElement(tag: string) {
  type MotionProps = HTMLAttributes<HTMLElement> & {
    initial?: unknown;
    animate?: unknown;
    exit?: unknown;
    transition?: unknown;
    whileHover?: unknown;
    whileTap?: unknown;
    whileInView?: unknown;
    viewport?: unknown;
  };
  const Component = forwardRef(
    (
      {
        children,
        initial,
        animate,
        exit,
        transition,
        whileHover,
        whileTap,
        whileInView,
        viewport,
        ...rest
      }: MotionProps,
      ref: Ref<HTMLElement>,
    ) => {
      void initial;
      void animate;
      void exit;
      void transition;
      void whileHover;
      void whileTap;
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
    AnimatePresence: ({ children }: { children: ReactNode }) => children,
    useReducedMotion: () => false,
  };
});

// ── Imports after mocks ────────────────────────────────────────────────────
import TatuadoresPage from "@/app/tatuadores/page";
import ArtistsHero from "@/components/artists/ArtistsHero";
import ArtistFeatures from "@/components/artists/ArtistFeatures";

describe("TatuadoresPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders Hero, ArtistFeatures and SecuritySection on /tatuadores without payment promises", () => {
    render(<TatuadoresPage />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /sua arte\. seu negócio\. seu controle\./i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /o controle total da sua arte\./i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Portfólio Verificado")).toBeInTheDocument();
    expect(screen.getByText("Gestão de Agenda")).toBeInTheDocument();
    expect(screen.getByText("Recebimentos Transparentes")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /seus dados e sua arte blindados/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Criptografia AES-256")).toBeInTheDocument();
    expect(screen.getByText("Verificação de Identidade OTP")).toBeInTheDocument();
    expect(screen.getByText("LGPD")).toBeInTheDocument();

    expect(screen.queryByText(/escrow/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/split payment/i)).not.toBeInTheDocument();
  });

  test("ArtistsHero renders floating dashboard metrics and points to #artist-features", () => {
    render(<ArtistsHero />);
    expect(screen.getByText("Ganhos")).toBeInTheDocument();
    expect(screen.getByText("R$ 4.500")).toBeInTheDocument();
    expect(screen.getByText("Agendamentos")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /explorar painel/i }),
    ).toHaveAttribute("href", "#artist-features");
  });

  test("ArtistFeatures renders all three real artist topics", () => {
    render(<ArtistFeatures />);
    expect(
      screen.getByRole("heading", { name: /o controle total da sua arte\./i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Portfólio Verificado")).toBeInTheDocument();
    expect(screen.getByText("Gestão de Agenda")).toBeInTheDocument();
    expect(screen.getByText("Recebimentos Transparentes")).toBeInTheDocument();
  });
});
