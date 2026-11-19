import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useProceduralAudio } from "@/components/useProceduralAudio";

describe("useProceduralAudio", () => {
  it("falha fora do ProceduralAudioProvider", () => {
    expect(() => renderHook(() => useProceduralAudio())).toThrow(
      "useProceduralAudio must be used within a ProceduralAudioProvider",
    );
  });
});
