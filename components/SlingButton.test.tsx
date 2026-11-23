import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SlingButton from "@/components/SlingButton";

/**
 * `useReducedMotion` do motion lê o estado global de `matchMedia` na primeira
 * chamada e não volta a consultá-lo, então cada teste escolhe o caminho pelo
 * mock. `animate` também é observado para inspecionar a velocidade de retorno.
 */
const motion = vi.hoisted(() => ({
  reduce: true,
  animate: vi.fn(),
}));

vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  return {
    ...actual,
    useReducedMotion: () => motion.reduce,
    animate: motion.animate,
  };
});

function setup(props: Partial<React.ComponentProps<typeof SlingButton>> = {}) {
  const onSend = vi.fn();
  const view = render(<SlingButton onSend={onSend} {...props} />);
  const button = view.container.querySelector("button");
  if (!button) throw new Error("SlingButton não renderizou um botão");
  return { ...view, button, onSend };
}

const drag = (button: HTMLButtonElement, from: number, to: number) => {
  fireEvent.pointerDown(button, {
    button: 0,
    pointerId: 1,
    clientX: from,
    clientY: 0,
  });
  fireEvent.pointerMove(button, { pointerId: 1, clientX: to, clientY: 0 });
};

describe("SlingButton", () => {
  beforeEach(() => {
    motion.reduce = true;
    motion.animate.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza o poço, o gatilho e o rótulo padrão", () => {
    const { button, container } = setup();

    expect(screen.getByText("Deslize para começar")).toBeInTheDocument();
    // O gatilho é só ícone: o nome acessível vem do rótulo visível.
    expect(
      screen.getByRole("button", { name: "Deslize para começar" }),
    ).toBe(button);
    expect(button).toHaveAttribute("type", "button");
    expect(container.querySelectorAll("circle")).toHaveLength(2);
    expect(button.style.width).toBe("64px");
    expect(button.style.height).toBe("64px");
    expect(button.className).toContain("cursor-grab");
    expect(button.className).not.toContain("ring-4");
  });

  it("aceita rótulo e tamanho personalizados", () => {
    const { button } = setup({ label: "Enviar convite", size: 80 });

    expect(screen.getByText("Enviar convite")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar convite" })).toBe(button);
    expect(button.style.width).toBe("80px");
    expect(button.style.height).toBe("80px");
  });

  it("arma depois do limiar e dispara onSend ao soltar", () => {
    const { button, onSend } = setup();

    fireEvent.pointerDown(button, {
      button: 0,
      pointerId: 1,
      clientX: 200,
      clientY: 0,
    });
    expect(button.className).toContain("cursor-grabbing");

    fireEvent.pointerMove(button, { pointerId: 1, clientX: 160, clientY: 0 });
    expect(button.className).not.toContain("ring-4");

    fireEvent.pointerMove(button, { pointerId: 1, clientX: 100, clientY: 0 });
    expect(button.className).toContain("ring-4");

    fireEvent.pointerUp(button, { pointerId: 1, clientX: 100, clientY: 0 });

    expect(onSend).toHaveBeenCalledTimes(1);
    expect(button.className).toContain("cursor-grab");
    expect(button.className).not.toContain("ring-4");
  });

  it("solta sem disparar quando o arrasto fica abaixo do limiar", () => {
    const { button, onSend } = setup();

    drag(button, 200, 180);
    fireEvent.pointerUp(button, { pointerId: 1, clientX: 180, clientY: 0 });

    expect(onSend).not.toHaveBeenCalled();
  });

  it("não dispara quando cancelado, mesmo armado", () => {
    const { button, onSend } = setup();

    drag(button, 200, 80);
    expect(button.className).toContain("ring-4");

    fireEvent.pointerCancel(button, { pointerId: 1, clientX: 80, clientY: 0 });

    expect(onSend).not.toHaveBeenCalled();
    expect(button.className).not.toContain("ring-4");
  });

  it("ignora o gesto quando desabilitado", () => {
    const { button, onSend } = setup({ disabled: true });

    drag(button, 200, 60);
    fireEvent.pointerUp(button, { pointerId: 1, clientX: 60, clientY: 0 });

    expect(onSend).not.toHaveBeenCalled();
    expect(button.className).toContain("cursor-grab");
  });

  it("ignora botões que não sejam o primário", () => {
    const { button, onSend } = setup();

    fireEvent.pointerDown(button, { button: 2, pointerId: 1, clientX: 200 });
    fireEvent.pointerMove(button, { pointerId: 1, clientX: 60, clientY: 0 });
    fireEvent.pointerUp(button, { pointerId: 1, clientX: 60, clientY: 0 });

    expect(onSend).not.toHaveBeenCalled();
    expect(button.className).toContain("cursor-grab");
  });

  it("ignora movimento sem captura ativa, com outro ponteiro ou sem deslocamento", () => {
    const { button, onSend } = setup();

    fireEvent.pointerMove(button, { pointerId: 9, clientX: 10, clientY: 0 });
    expect(button.className).not.toContain("ring-4");

    fireEvent.pointerDown(button, {
      button: 0,
      pointerId: 1,
      clientX: 200,
      clientY: 0,
    });
    // Segundo pointerdown é ignorado enquanto a captura está ativa.
    fireEvent.pointerDown(button, {
      button: 0,
      pointerId: 2,
      clientX: 0,
      clientY: 0,
    });
    // Ponteiro diferente do capturado não move o gatilho.
    fireEvent.pointerMove(button, { pointerId: 2, clientX: 40, clientY: 0 });
    // Deslocamento zero também é descartado.
    fireEvent.pointerMove(button, { pointerId: 1, clientX: 200, clientY: 0 });

    expect(button.className).not.toContain("ring-4");

    fireEvent.pointerUp(button, { pointerId: 1, clientX: 200, clientY: 0 });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("mantém a captura quando o ponteiro é liberado por outro id", () => {
    const { button, onSend } = setup();

    drag(button, 200, 80);
    fireEvent.pointerUp(button, { pointerId: 5, clientX: 80, clientY: 0 });

    expect(onSend).not.toHaveBeenCalled();
    // A captura continua ativa: o gesto real ainda dispara.
    fireEvent.pointerUp(button, { pointerId: 1, clientX: 80, clientY: 0 });
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("usa mola de retorno quando o movimento não é reduzido", () => {
    motion.reduce = false;
    const { button, onSend } = setup();

    drag(button, 200, 100);
    fireEvent.pointerUp(button, { pointerId: 1, clientX: 100, clientY: 0 });

    expect(onSend).toHaveBeenCalledTimes(1);
    expect(motion.animate).toHaveBeenCalledTimes(2);
    const [, , options] = motion.animate.mock.calls[0] as [
      unknown,
      number,
      { type: string; velocity: number },
    ];
    expect(options.type).toBe("spring");
    // d = 160 * 100 / (160 + 100) = 61.54 → p = 1.28 → 2600 * 1.28.
    expect(options.velocity).toBeCloseTo(3333.33, 1);
  });

  it("limita a velocidade do gesto e da mão", () => {
    motion.reduce = false;
    const { button, onSend } = setup();

    let now = 1_000;
    vi.spyOn(performance, "now").mockImplementation(() => now);

    fireEvent.pointerDown(button, {
      button: 0,
      pointerId: 1,
      clientX: 0,
      clientY: 0,
    });

    // Arrasta longe e volta um pouco: o histórico inverte o sinal da velocidade
    // e o gatilho soma velocidade + impulso, estourando o teto da mão.
    now = 1_001;
    fireEvent.pointerMove(button, { pointerId: 1, clientX: 400, clientY: 0 });
    now = 1_002;
    fireEvent.pointerMove(button, { pointerId: 1, clientX: 200, clientY: 0 });

    now = 1_003;
    fireEvent.pointerUp(button, { pointerId: 1, clientX: 200, clientY: 0 });

    expect(onSend).toHaveBeenCalledTimes(1);
    const [, , options] = motion.animate.mock.calls[0] as [
      unknown,
      number,
      { velocity: number },
    ];
    // Velocidade do gesto limitada a 3000 e impulso a 3900 → teto de 6000.
    expect(Math.abs(options.velocity)).toBe(6000);
  });

  it("descarta amostras antigas do histórico de gesto", () => {
    motion.reduce = false;
    const { button, onSend } = setup();

    let now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => now);

    fireEvent.pointerDown(button, {
      button: 0,
      pointerId: 1,
      clientX: 200,
      clientY: 0,
    });
    for (const offset of [10, 20, 30, 40, 50, 60]) {
      now += 100;
      fireEvent.pointerMove(button, {
        pointerId: 1,
        clientX: 200 - offset,
        clientY: 0,
      });
    }

    fireEvent.pointerUp(button, { pointerId: 1, clientX: 140, clientY: 0 });

    expect(onSend).not.toHaveBeenCalled();
    expect(motion.animate).toHaveBeenCalledTimes(2);
  });
});
