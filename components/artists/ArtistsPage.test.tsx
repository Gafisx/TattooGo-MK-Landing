import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
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
  };
});

// ── Imports after mocks ────────────────────────────────────────────────────
import TatuadoresPage from "@/app/tatuadores/page";
import ArtistsHero from "@/components/artists/ArtistsHero";
import ArtistsDashboard from "@/components/artists/ArtistsDashboard";
import FuseButton from "@/components/ui/FuseButton";

describe("TatuadoresPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("renders Hero and Dashboard on the /tatuadores page", () => {
    render(<TatuadoresPage />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /sua arte\. seu negócio\. seu controle\./i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /agenda sem caos/i }),
    ).toBeInTheDocument();
  });

  test("ArtistsHero renders floating dashboard metrics", () => {
    render(<ArtistsHero />);
    expect(screen.getByText("Ganhos")).toBeInTheDocument();
    expect(screen.getByText("R$ 4.500")).toBeInTheDocument();
    expect(screen.getByText("Agendamentos")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  test("ArtistsDashboard renders FuseButton inside Agenda Sem Caos", () => {
    render(<ArtistsDashboard />);
    expect(
      screen.getByRole("heading", { name: /agenda sem caos/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /segure para liberar pagamento/i }),
    ).toBeInTheDocument();
  });

  test("FuseButton cancels on early release and completes after 2 seconds hold", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();

    render(
      <FuseButton
        label="Segure para liberar pagamento"
        completedLabel="Pagamento liberado"
        durationMs={2000}
        onComplete={onComplete}
      />,
    );

    const btn = screen.getByRole("button", {
      name: /segure para liberar pagamento/i,
    });

    // Solta antes de completar 2s -> não deve completar
    fireEvent.pointerDown(btn);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    fireEvent.pointerUp(btn);
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(onComplete).not.toHaveBeenCalled();

    // Segura pelos 2s completos -> deve concluir e chamar onComplete
    fireEvent.pointerDown(btn);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Pagamento liberado")).toBeInTheDocument();
  });
});
