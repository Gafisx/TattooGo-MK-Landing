import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DepthText from "@/components/DepthText";
import { setPrefersReducedMotion } from "@/tests/setup/mocks/matchMedia";

function stubFrames() {
  const frames: FrameRequestCallback[] = [];
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  return {
    get pending() {
      return frames.length;
    },
    run(timestamp: number) {
      const next = frames[frames.length - 1];
      if (next) act(() => next(timestamp));
    },
  };
}

describe("DepthText", () => {
  beforeEach(() => {
    setPrefersReducedMotion(false);
  });

  it("empilha as camadas de fumaça atrás da face nítida", () => {
    const { container } = render(
      <DepthText layers={3} depth={2}>
        <span>Arte</span>
      </DepthText>,
    );

    expect(container.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(3);
    expect(screen.getAllByText("Arte")).toHaveLength(4);
    const stage = container.querySelector(".inline-grid");
    expect(stage).not.toBeNull();
    expect(stage?.getAttribute("style")).toContain("preserve-3d");
  });

  it("limita camadas e profundidade aos valores seguros", () => {
    const many = render(
      <DepthText layers={99} depth={99}>
        Arte
      </DepthText>,
    );
    expect(many.container.querySelectorAll('span[aria-hidden="true"]'))
      .toHaveLength(20);
    many.unmount();

    const few = render(
      <DepthText layers={1} depth={-4}>
        Arte
      </DepthText>,
    );
    expect(few.container.querySelectorAll('span[aria-hidden="true"]'))
      .toHaveLength(2);
  });

  it("anima a entrada até a profundidade final", () => {
    const frames = stubFrames();
    const { container } = render(
      <DepthText layers={2}>
        Arte
      </DepthText>,
    );
    const stage = container.querySelector<HTMLElement>(".inline-grid");

    expect(frames.pending).toBe(1);
    frames.run(16);
    expect(stage?.style.getPropertyValue("--depth-grow")).not.toBe("");
    expect(stage?.style.transform).toContain("rotateX(");
    expect(frames.pending).toBe(2);

    frames.run(2_000);
    // Cada frame avança no máximo 50ms, então a entrada de 1200ms precisa de
    // vários frames para chegar ao fim.
    for (let frame = 1; frame <= 25; frame += 1) {
      frames.run(2_000 + frame * 50);
    }
    expect(stage?.style.getPropertyValue("--depth-grow")).toBe("1.0000");
  });

  it("não agenda animação quando o movimento é reduzido", () => {
    setPrefersReducedMotion(true);
    const frames = stubFrames();
    render(
      <DepthText layers={2}>
        Arte
      </DepthText>,
    );

    expect(frames.pending).toBe(0);
  });
});
