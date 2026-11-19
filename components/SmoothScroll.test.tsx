import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SmoothScroll from "@/components/SmoothScroll";
import { setPrefersReducedMotion } from "@/tests/setup/mocks/matchMedia";

const lenisMock = vi.hoisted(() => {
  class Lenis {
    static instances: Lenis[] = [];
    raf = vi.fn();
    on = vi.fn();
    destroy = vi.fn();
    constructor() {
      Lenis.instances.push(this);
    }
  }
  return { Lenis };
});

vi.mock("lenis", () => ({ default: lenisMock.Lenis }));

describe("SmoothScroll", () => {

  beforeEach(() => {
    lenisMock.Lenis.instances = [];
  });

  afterEach(cleanup);

  it("não instancia Lenis em preferência reduzida", () => {
    setPrefersReducedMotion(true);
    render(<SmoothScroll><main>conteúdo</main></SmoothScroll>);
    expect(lenisMock.Lenis.instances).toHaveLength(0);
  });

  it("instancia Lenis e destrói recursos no unmount", () => {
    setPrefersReducedMotion(false);
    const { unmount } = render(
      <SmoothScroll><main>conteúdo</main></SmoothScroll>,
    );
    expect(lenisMock.Lenis.instances).toHaveLength(1);
    unmount();
    expect(lenisMock.Lenis.instances[0].destroy).toHaveBeenCalled();
  });
});
