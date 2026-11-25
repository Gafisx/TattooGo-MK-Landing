import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { hydrateRoot } from "react-dom/client";

import { renderToString } from "react-dom/server";

import { beforeEach, describe, expect, it, vi } from "vitest";

import FlipCard from "@/components/FlipCard";

/**
 * `useReducedMotion` do motion guarda o estado global de `matchMedia` na
 * primeira leitura, então o mock decide o caminho por teste. `animate` aplica o
 * valor final de imediato para que o giro seja observável sem esperar a mola.
 */
const motion = vi.hoisted(() => ({
  // `null` reproduz o retorno de `useReducedMotion` durante o SSR.
  reduce: false as boolean | null,
  animate: vi.fn((target: { set: (value: number) => void }, to: number) => {
    target.set(to);
  }),
}));

vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  return {
    ...actual,
    useReducedMotion: () => motion.reduce,
    animate: motion.animate,
  };
});

function setup(props: Partial<React.ComponentProps<typeof FlipCard>> = {}) {
  const view = render(
    <FlipCard
      front={<p>Frente do cartão</p>}
      back={<p>Verso do cartão</p>}
      {...props}
    />,
  );
  const root = view.container.firstElementChild;
  if (!(root instanceof HTMLElement)) {
    throw new Error("FlipCard não renderizou a raiz");
  }
  const stage = root.querySelector<HTMLElement>(".preserve-3d");
  return { ...view, root, stage };
}

function requireStage(stage: HTMLElement | null): HTMLElement {
  if (!stage) throw new Error("FlipCard stage não foi renderizado");
  return stage;
}

function rotateY(stage: HTMLElement | null) {
  const realStage = requireStage(stage);
  const style = realStage.getAttribute("style") ?? "";
  const match = /rotateY\((-?\d+(?:\.\d+)?)deg\)/.exec(style);
  return match ? Number(match[1]) : null;
}

const pointer = (pointerType = "mouse") => ({
  button: 0,
  pointerId: 1,
  clientX: 100,
  clientY: 100,
  pointerType,
});

describe("FlipCard", () => {
  beforeEach(() => {
    motion.reduce = false;
    motion.animate.mockClear();
  });

  it("renderiza frente e verso com as medidas pedidas", () => {
    const { root, stage } = setup({
      width: "320px",
      height: "420px",
      className: "minha-classe",
    });

    expect(screen.getByText("Frente do cartão")).toBeInTheDocument();
    expect(screen.getByText("Verso do cartão")).toBeInTheDocument();
    expect(root.style.width).toBe("320px");
    expect(root.style.height).toBe("420px");
    expect(root.className).toContain("minha-classe");
    expect(root.style.perspective).toBe("1200px");
    expect(stage).not.toBeNull();
    expect(rotateY(stage)).toBe(0);
  });

  it("usa as medidas padrão", () => {
    const { root } = setup();

    expect(root.style.width).toBe("100%");
    expect(root.style.height).toBe("500px");
  });

  it("gira ao tocar sem arrastar", async () => {
    const { root, stage } = setup();

    fireEvent.pointerDown(root, pointer());
    fireEvent.pointerUp(root, pointer());

    await waitFor(() => expect(rotateY(stage)).toBe(180));
    expect(motion.animate).toHaveBeenCalledWith(
      expect.anything(),
      180,
      expect.objectContaining({ type: "spring" }),
    );
  });

  it("acompanha o arrasto e solta no múltiplo de 180 mais próximo", async () => {
    const { root, stage } = setup();
    Object.defineProperty(root, "offsetWidth", {
      value: 300,
      configurable: true,
    });

    fireEvent.pointerDown(root, pointer());
    fireEvent.pointerMove(root, { ...pointer(), clientX: 250 });

    await waitFor(() => expect(rotateY(stage)).toBeCloseTo(90, 0));

    fireEvent.pointerUp(root, { ...pointer(), clientX: 250 });

    await waitFor(() => expect(rotateY(stage)).toBe(180));
  });

  it("gira quando o deslocamento fica dentro da folga do clique", async () => {
    const { root, stage } = setup();

    fireEvent.pointerDown(root, pointer());
    fireEvent.pointerMove(root, { ...pointer(), clientX: 102 });
    fireEvent.pointerUp(root, { ...pointer(), clientX: 102 });

    await waitFor(() => expect(rotateY(stage)).toBe(180));
  });

  it("volta para a base quando o gesto é cancelado", async () => {
    const { root, stage } = setup();
    Object.defineProperty(root, "offsetWidth", {
      value: 300,
      configurable: true,
    });

    fireEvent.pointerDown(root, pointer());
    fireEvent.pointerMove(root, { ...pointer(), clientX: 250 });
    await waitFor(() => expect(rotateY(stage)).toBeCloseTo(90, 0));

    fireEvent.pointerCancel(root, { ...pointer(), clientX: 250 });

    await waitFor(() => expect(rotateY(stage)).toBe(0));
    expect(motion.animate).toHaveBeenCalledWith(
      expect.anything(),
      0,
      expect.objectContaining({ type: "spring" }),
    );
  });

  it("ignora botões que não sejam o primário", async () => {
    const { root, stage } = setup();

    fireEvent.pointerDown(root, { ...pointer(), button: 2 });
    fireEvent.pointerUp(root, { ...pointer(), button: 2 });

    expect(motion.animate).not.toHaveBeenCalled();
    expect(rotateY(stage)).toBe(0);
  });

  it("usa folga maior no toque e ignora inclinação por toque", async () => {
    const { root, stage } = setup();
    Object.defineProperty(root, "offsetWidth", {
      value: 300,
      configurable: true,
    });

    // 6px passa da folga fina (4px), mas não da grossa (8px): ainda é clique.
    fireEvent.pointerDown(root, pointer("touch"));
    fireEvent.pointerMove(root, {
      ...pointer("touch"),
      clientX: 106,
    });
    expect(rotateY(stage)).toBe(0);

    fireEvent.pointerUp(root, { ...pointer("touch"), clientX: 106 });
    await waitFor(() => expect(rotateY(stage)).toBe(180));
  });

  it("inclina no hover com mouse e zera ao sair", async () => {
    const { root, stage } = setup();

    fireEvent.pointerEnter(root);
    fireEvent.pointerMove(root, {
      ...pointer(),
      clientX: 400,
      clientY: 400,
    });

    await waitFor(() => {
      expect(rotateY(stage)).not.toBe(0);
    });

    fireEvent.pointerLeave(root);

    await waitFor(() => expect(rotateY(stage)).toBe(0));
  });

  it("hidrata sem divergência quando o servidor não conhece a preferência", async () => {
    const element = (
      <FlipCard front={<p>Frente do cartão</p>} back={<p>Verso do cartão</p>} />
    );

    // No servidor o hook devolve `null`; no cliente reduzido, `true`.
    motion.reduce = null;
    const markup = renderToString(element);
    expect(markup).toContain("rotateY(0deg)");

    motion.reduce = true;
    const container = document.createElement("div");
    container.innerHTML = markup;
    document.body.append(container);

    const errors: string[] = [];
    const spy = vi.spyOn(console, "error").mockImplementation((...args) => {
      errors.push(args.map((arg) => String(arg)).join(" "));
    });

    await act(async () => {
      hydrateRoot(container, element);
    });
    spy.mockRestore();

    expect(errors.join("\n")).not.toMatch(/hydration|did not match/i);
    container.remove();
  });

  it("não inclina com movimento reduzido", async () => {
    motion.reduce = true;
    const { root, stage } = setup();

    fireEvent.pointerEnter(root);
    fireEvent.pointerMove(root, {
      ...pointer(),
      clientX: 400,
      clientY: 400,
    });
    fireEvent.pointerDown(root, pointer());
    fireEvent.pointerMove(root, { ...pointer(), clientX: 250 });

    // Sem rotação aplicada: o rotor fica inerte depois de montar.
    expect(rotateY(stage)).toBeNull();
    expect(requireStage(stage).style.transform).toBe("none");
    expect(motion.animate).not.toHaveBeenCalled();

    fireEvent.pointerUp(root, { ...pointer(), clientX: 250 });
    expect(motion.animate).not.toHaveBeenCalled();
  });
});
