import { FakeAudioContext, installFakeAudioContext } from "@/tests/setup/mocks/audio";

export function installAudioHarness() {
  const constructor = installFakeAudioContext();
  return {
    constructor,
    getContext() {
      const context = FakeAudioContext.instances.at(-1);
      if (!context) {
        throw new Error("The audio context has not been created yet.");
      }
      return context;
    },
  };
}
