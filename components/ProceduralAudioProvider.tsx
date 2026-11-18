"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Volume2, VolumeX } from "lucide-react";

import { useScrollStore } from "@/components/scrollProgressStore";
import {
  ProceduralAudioContext,
  type ProceduralAudioContextValue,
} from "@/components/useProceduralAudio";

type AudioGraph = {
  context: AudioContext;
  masterGain: GainNode;
  machineGain: GainNode;
  noiseGain: GainNode;
  machineOscillator: OscillatorNode;
};

function updateMachineSound(graph: AudioGraph, progress: number) {
  const { context, machineGain, noiseGain, machineOscillator } = graph;
  const now = context.currentTime;
  const isTattooing = progress > 0.05 && progress < 0.95;

  if (!isTattooing) {
    machineGain.gain.setValueAtTime(0, now);
    noiseGain.gain.setValueAtTime(0, now);
    return;
  }

  machineGain.gain.setTargetAtTime(0.045, now, 0.08);
  noiseGain.gain.setTargetAtTime(0.018, now, 0.08);
  machineOscillator.frequency.setTargetAtTime(58 + progress * 14, now, 0.12);
}

export function ProceduralAudioProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [muted, setMuted] = useState(true);
  const mutedRef = useRef(true);
  const graphRef = useRef<AudioGraph | null>(null);
  const unsubscribeProgressRef = useRef<(() => void) | null>(null);

  const createAudioGraph = useCallback(() => {
    if (graphRef.current) return graphRef.current;

    if (typeof window.AudioContext === "undefined") {
      console.error("Web Audio API is not supported in this browser.");
      return null;
    }

    const context = new window.AudioContext();
    const masterGain = context.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(context.destination);

    const machineGain = context.createGain();
    machineGain.gain.value = 0;
    machineGain.connect(masterGain);

    const machineOscillator = context.createOscillator();
    machineOscillator.type = "sawtooth";
    machineOscillator.frequency.value = 58;
    machineOscillator.connect(machineGain);
    machineOscillator.start();

    const noiseBuffer = context.createBuffer(
      1,
      context.sampleRate,
      context.sampleRate,
    );
    const noiseData = noiseBuffer.getChannelData(0);
    for (let index = 0; index < noiseData.length; index += 1) {
      noiseData[index] = Math.random() * 2 - 1;
    }

    const noiseSource = context.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = context.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 900;

    const noiseGain = context.createGain();
    noiseGain.gain.value = 0;
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSource.start();

    const graph = {
      context,
      masterGain,
      machineGain,
      noiseGain,
      machineOscillator,
    };
    graphRef.current = graph;

    unsubscribeProgressRef.current = useScrollStore.subscribe((state) => {
      updateMachineSound(graph, state.progress);
    });
    updateMachineSound(graph, useScrollStore.getState().progress);

    return graph;
  }, []);

  const toggleMuted = useCallback(async () => {
    if (!mutedRef.current) {
      mutedRef.current = true;
      setMuted(true);
      const graph = graphRef.current;
      if (graph) {
        graph.masterGain.gain.setTargetAtTime(
          0,
          graph.context.currentTime,
          0.025,
        );
      }
      return;
    }

    const graph = createAudioGraph();
    if (!graph) return;

    if (!document.hidden) {
      try {
        await graph.context.resume();
      } catch (error) {
        console.error("Unable to resume procedural audio.", error);
        return;
      }
    }

    mutedRef.current = false;
    setMuted(false);
    if (!document.hidden) {
      graph.masterGain.gain.setTargetAtTime(
        0.2,
        graph.context.currentTime,
        0.025,
      );
    }
  }, [createAudioGraph]);

  const playHoverClick = useCallback(() => {
    const graph = graphRef.current;
    if (mutedRef.current || !graph || graph.context.state !== "running") return;

    const { context, masterGain } = graph;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(780, now);
    oscillator.frequency.exponentialRampToValueAtTime(520, now + 0.055);
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(0.07, now + 0.006);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    oscillator.connect(envelope);
    envelope.connect(masterGain);
    oscillator.addEventListener(
      "ended",
      () => {
        oscillator.disconnect();
        envelope.disconnect();
      },
      { once: true },
    );
    oscillator.start(now);
    oscillator.stop(now + 0.065);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const graph = graphRef.current;
      if (!graph) return;

      const operation = document.hidden
        ? graph.context.suspend()
        : mutedRef.current
          ? Promise.resolve()
          : graph.context.resume();

      void operation.catch((error: unknown) => {
        console.error("Unable to update procedural audio visibility.", error);
      });

      if (!document.hidden && !mutedRef.current) {
        graph.masterGain.gain.setTargetAtTime(
          0.2,
          graph.context.currentTime,
          0.025,
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(
    () => () => {
      unsubscribeProgressRef.current?.();
      const graph = graphRef.current;
      graphRef.current = null;
      if (graph && graph.context.state !== "closed") {
        void graph.context.close().catch((error: unknown) => {
          console.error("Unable to close procedural audio.", error);
        });
      }
    },
    [],
  );

  const value = useMemo<ProceduralAudioContextValue>(
    () => ({ muted, toggleMuted, playHoverClick }),
    [muted, toggleMuted, playHoverClick],
  );

  return (
    <ProceduralAudioContext.Provider value={value}>
      {children}
      <button
        type="button"
        aria-label={muted ? "Ativar áudio" : "Silenciar áudio"}
        aria-pressed={!muted}
        onClick={() => void toggleMuted()}
        className="fixed bottom-5 right-5 z-[100] inline-flex size-12 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[#1a1a1a]/90 text-white shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-[background-color,box-shadow,transform] duration-200 hover:scale-105 hover:bg-[#242424] hover:shadow-[0_0_24px_rgba(255,102,0,0.35)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF9900] motion-reduce:transition-none"
      >
        {muted ? (
          <VolumeX aria-hidden="true" size={20} />
        ) : (
          <Volume2 aria-hidden="true" size={20} />
        )}
      </button>
    </ProceduralAudioContext.Provider>
  );
}
