import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  closeTopBarAction,
  getTopBarActionState,
  openTopBarAction,
  resetTopBarActionStoreForTests,
  subscribeToTopBarAction,
} from "@/lib/topBarActionStore";

describe("topBarActionStore", () => {
  beforeEach(() => {
    resetTopBarActionStoreForTests();
  });

  test("abre, notifica inscritos e mantém referência estável sem mudanças", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToTopBarAction(listener);

    openTopBarAction("open-help", "landing");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getTopBarActionState()).toEqual({
      actionId: "open-help",
      context: "landing",
    });

    const snapshot = getTopBarActionState();
    openTopBarAction("open-help", "landing");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getTopBarActionState()).toBe(snapshot);

    unsubscribe();
    openTopBarAction("open-terms", "support");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("fecha e não notifica quando já está fechado", () => {
    const listener = vi.fn();
    subscribeToTopBarAction(listener);

    closeTopBarAction();
    expect(listener).not.toHaveBeenCalled();

    openTopBarAction("open-feedback", "clientes");
    closeTopBarAction();

    expect(listener).toHaveBeenCalledTimes(2);
    expect(getTopBarActionState()).toBeNull();
  });

  test("cancelar inscrição remove o listener", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToTopBarAction(listener);
    unsubscribe();
    openTopBarAction("open-map", "clientes");
    expect(listener).not.toHaveBeenCalled();
  });
});
