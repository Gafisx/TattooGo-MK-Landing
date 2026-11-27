import { useSyncExternalStore } from "react";
import type { TopBarActionId, TopBarContextKey } from "@/lib/topBarConfig";

/**
 * Estado compartilhado mínimo entre `AppleTopBar` (que anuncia `aria-expanded`)
 * e o `TopBarActionSheet` (que abre/fecha). Um store externo evita prop drilling
 * e mantém a barra sem re-render global a cada tecla digitada no formulário.
 */

export type TopBarActionState = {
  readonly actionId: TopBarActionId;
  readonly context: TopBarContextKey;
} | null;

type Listener = () => void;

const listeners = new Set<Listener>();
let state: TopBarActionState = null;

function emit() {
  for (const listener of listeners) listener();
}

export function openTopBarAction(
  actionId: TopBarActionId,
  context: TopBarContextKey,
): void {
  if (state?.actionId === actionId && state.context === context) return;
  state = { actionId, context };
  emit();
}

export function closeTopBarAction(): void {
  if (state === null) return;
  state = null;
  emit();
}

export function getTopBarActionState(): TopBarActionState {
  return state;
}

export function subscribeToTopBarAction(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Hook de leitura usado pela barra superior. */
export function useTopBarActionState(): TopBarActionState {
  return useSyncExternalStore(
    subscribeToTopBarAction,
    getTopBarActionState,
    () => null,
  );
}

/** Limpa o estado entre testes automatizados. */
export function resetTopBarActionStoreForTests(): void {
  state = null;
  listeners.clear();
}
