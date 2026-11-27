import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  TOP_BAR_SCROLL_OFFSET,
  cancelActiveContextualScroll,
  isContextualScrollActive,
  registerScrollSmoother,
  scrollToSection,
  type ScrollSmoother,
} from "@/lib/contextualScroll";
import { installControlledObservers } from "@/tests/setup/mocks/observers";

const RECT_TOP = 900;

function mountSection(id: string) {
  const element = document.createElement("section");
  element.id = id;
  element.getBoundingClientRect = () =>
    ({ top: RECT_TOP, bottom: RECT_TOP + 400, left: 0, right: 1000, width: 1000, height: 400, x: 0, y: RECT_TOP, toJSON: () => ({}) }) as DOMRect;
  document.body.appendChild(element);
  return element;
}

describe("scrollToSection", () => {
  let scrollTo: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true, writable: true });
  });

  afterEach(() => {
    cancelActiveContextualScroll();
    registerScrollSmoother(null);
    document.body.innerHTML = "";
  });

  test("retorna false quando a seção não existe no layout", () => {
    expect(scrollToSection("secao-inexistente")).toBe(false);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  test("prefers-reduced-motion salta direto, sem animação", () => {
    mountSection("estilos");
    const onComplete = vi.fn();

    expect(scrollToSection("estilos", { reducedMotion: true, onComplete })).toBe(true);
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({
      top: RECT_TOP - TOP_BAR_SCROLL_OFFSET,
      left: 0,
      behavior: "auto",
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(isContextualScrollActive()).toBe(false);
  });

  test("cede imediatamente ao wheel do usuário", () => {
    installControlledObservers();
    mountSection("estilos");
    const onCancel = vi.fn();

    expect(scrollToSection("estilos", { duration: 620, onCancel })).toBe(true);
    expect(isContextualScrollActive()).toBe(true);

    // Primeiro frame agenda o próximo.
    (window.requestAnimationFrame as unknown as { mock: { calls: [FrameRequestCallback][] } }).mock.calls.at(-1)?.[0](0);
    const framesBeforeCancel = scrollTo.mock.calls.length;
    expect(framesBeforeCancel).toBeGreaterThan(0);

    window.dispatchEvent(new Event("wheel"));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(isContextualScrollActive()).toBe(false);

    // Nenhum frame pendente deve escrever scroll depois do cancelamento.
    const frameCallback = (window.requestAnimationFrame as unknown as { mock: { calls: [FrameRequestCallback][] } }).mock.calls.at(-1)?.[0];
    frameCallback?.(120);
    expect(scrollTo.mock.calls.length).toBe(framesBeforeCancel);
  });

  test("delega ao smoother registrado (Lenis) com lock desativado", () => {
    mountSection("clientes-top");
    const smoother: ScrollSmoother = { scrollTo: vi.fn() };
    registerScrollSmoother(smoother);

    expect(scrollToSection("clientes-top")).toBe(true);
    expect(smoother.scrollTo).toHaveBeenCalledTimes(1);
    expect(smoother.scrollTo).toHaveBeenCalledWith(
      RECT_TOP - TOP_BAR_SCROLL_OFFSET,
      expect.objectContaining({ lock: false, force: true, immediate: false }),
    );
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
