import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createElement, forwardRef } from "react";
import type { HTMLAttributes, ReactNode, Ref } from "react";

function makeMotionElement(tag: string) {
  type MotionProps = HTMLAttributes<HTMLElement> & {
    initial?: unknown;
    animate?: unknown;
    exit?: unknown;
    transition?: unknown;
    whileHover?: unknown;
    whileTap?: unknown;
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

import FuseButton from "@/components/ui/FuseButton";

describe("FuseButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("cancels on early release and completes after 2 seconds hold", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();

    render(
      <FuseButton
        label="Segure para confirmar"
        completedLabel="Confirmado"
        durationMs={2000}
        onComplete={onComplete}
      />,
    );

    const btn = screen.getByRole("button", {
      name: /segure para confirmar/i,
    });

    fireEvent.pointerDown(btn);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    fireEvent.pointerUp(btn);
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(onComplete).not.toHaveBeenCalled();

    fireEvent.pointerDown(btn);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Confirmado")).toBeInTheDocument();
  });

  test("supports keyboard hold with Space and Enter", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();

    render(
      <FuseButton
        label="Segure para confirmar"
        completedLabel="Confirmado"
        durationMs={1000}
        onComplete={onComplete}
      />,
    );

    const btn = screen.getByRole("button", {
      name: /segure para confirmar/i,
    });

    fireEvent.keyDown(btn, { key: " " });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.keyUp(btn, { key: " " });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onComplete).not.toHaveBeenCalled();

    fireEvent.keyDown(btn, { key: "Enter" });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
