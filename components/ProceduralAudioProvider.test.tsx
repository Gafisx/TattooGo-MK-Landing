import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProceduralAudioProvider } from "@/components/ProceduralAudioProvider";
import { useProceduralAudio } from "@/components/useProceduralAudio";
import { useScrollStore } from "@/components/scrollProgressStore";
import {
  FakeAudioContext,
  installFakeAudioContext,
} from "@/tests/setup/mocks/audio";
import { setPrefersReducedMotion } from "@/tests/setup/mocks/matchMedia";
import { renderWithProviders } from "@/tests/utils/render";

function AudioProbe() {
  const { muted, playHoverClick } = useProceduralAudio();
  return (
    <button type="button" onMouseEnter={playHoverClick}>
      {muted ? "mudo" : "ativo"}
    </button>
  );
}

describe("ProceduralAudioProvider", () => {
  beforeEach(() => {
    useScrollStore.setState({ progress: 0 });
    FakeAudioContext.instances = [];
    setPrefersReducedMotion(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("cria o contexto e ativa o áudio somente após o gesto do usuário", async () => {
    const AudioContextConstructor = installFakeAudioContext();
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);

    renderWithProviders(
      <ProceduralAudioProvider>
        <AudioProbe />
      </ProceduralAudioProvider>,
    );

    expect(AudioContextConstructor).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Ativar áudio" }));

    expect(await screen.findByRole("button", { name: "Silenciar áudio" }))
      .toBeInTheDocument();
    expect(AudioContextConstructor).toHaveBeenCalledTimes(1);
  });

  it("deve silenciar áudio quando preferência de movimento reduzido estiver ativa", () => {
    const AudioContextConstructor = installFakeAudioContext();
    setPrefersReducedMotion(true);

    renderWithProviders(
      <ProceduralAudioProvider>
        <AudioProbe />
      </ProceduralAudioProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Ativar áudio" }));
    expect(AudioContextConstructor).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Ativar áudio" }))
      .toHaveAttribute("aria-pressed", "false");
  });

  it("gera zumbido durante o scroll na faixa e silencia ao pausar ou sair dela", async () => {
    vi.useFakeTimers();
    installFakeAudioContext();
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);

    renderWithProviders(
      <ProceduralAudioProvider>
        <AudioProbe />
      </ProceduralAudioProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Ativar áudio" }));
      await Promise.resolve();
    });

    const context = FakeAudioContext.instances[0];
    const machineGain = context.createGain.mock.results[1].value;
    const noiseGain = context.createGain.mock.results[2].value;
    const machineOscillator = context.createOscillator.mock.results[0].value;

    act(() => useScrollStore.getState().setProgress(0.05));
    expect(machineGain.gain.setTargetAtTime).toHaveBeenLastCalledWith(0, 12, 0.045);

    act(() => useScrollStore.getState().setProgress(0.5));
    expect(machineGain.gain.setTargetAtTime).toHaveBeenLastCalledWith(
      0.045,
      12,
      0.08,
    );
    expect(noiseGain.gain.setTargetAtTime).toHaveBeenLastCalledWith(
      0.018,
      12,
      0.08,
    );
    expect(machineOscillator.frequency.setTargetAtTime).toHaveBeenLastCalledWith(
      65,
      12,
      0.12,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(220);
    });
    expect(machineGain.gain.setTargetAtTime).toHaveBeenLastCalledWith(
      0,
      12,
      0.045,
    );

    act(() => useScrollStore.getState().setProgress(0.96));
    expect(noiseGain.gain.setTargetAtTime).toHaveBeenLastCalledWith(
      0,
      12,
      0.045,
    );
  });

  it("silencia um grafo ativo se reduced-motion for ativado", async () => {
    const motionPreference = setPrefersReducedMotion(false);
    installFakeAudioContext();
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);

    renderWithProviders(
      <ProceduralAudioProvider>
        <AudioProbe />
      </ProceduralAudioProvider>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Ativar áudio" }));
      await Promise.resolve();
    });
    const context = FakeAudioContext.instances[0];

    act(() => motionPreference.update(true));
    expect(context.createGain.mock.results[0].value.gain.setTargetAtTime)
      .toHaveBeenLastCalledWith(0, 12, 0.025);
    expect(screen.getByRole("button", { name: "Ativar áudio" }))
      .toHaveAttribute("aria-pressed", "false");
  });

  it("fecha o contexto no unmount", () => {
    installFakeAudioContext();
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);

    const { unmount } = renderWithProviders(
      <ProceduralAudioProvider>
        <AudioProbe />
      </ProceduralAudioProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Ativar áudio" }));
    unmount();
  });
});
