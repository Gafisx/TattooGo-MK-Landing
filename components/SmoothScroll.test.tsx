import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SmoothScroll from "@/components/SmoothScroll";
import { setPrefersReducedMotion } from "@/tests/setup/mocks/matchMedia";

const lenisMock = vi.hoisted(() => {
  const scrollTo = vi.fn();
  class Lenis {
    static instances: Lenis[] = [];
    raf = vi.fn();
    on = vi.fn();
    destroy = vi.fn();
    scrollTo = scrollTo;
    constructor() {
      Lenis.instances.push(this);
    }
  }
  return { Lenis, scrollTo };
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

  it("não intercepta cliques em âncoras com prefers-reduced-motion ativo", () => {
    setPrefersReducedMotion(true);
    const { getByRole } = render(
      <SmoothScroll>
        <main>
          <a href="#target">ir para o alvo</a>
          <div id="target">alvo</div>
        </main>
      </SmoothScroll>,
    );

    // Sem Lenis ativo, o navegador deve executar o scroll nativo da âncora.
    expect(lenisMock.Lenis.instances).toHaveLength(0);

    const link = getByRole("link", { name: "ir para o alvo" });
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    const preventDefault = vi.spyOn(event, "preventDefault");

    link.dispatchEvent(event);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
    expect(lenisMock.scrollTo).not.toHaveBeenCalled();
  });
});
