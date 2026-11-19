export class FakeAudioParam {
  value = 0;
  setValueAtTime = vi.fn();
  setTargetAtTime = vi.fn();
  linearRampToValueAtTime = vi.fn();
  exponentialRampToValueAtTime = vi.fn();
}

export class FakeAudioNode {
  readonly gain = new FakeAudioParam();
  readonly frequency = new FakeAudioParam();
  connect = vi.fn();
  disconnect = vi.fn();
  addEventListener = vi.fn();
}

export class FakeOscillatorNode extends FakeAudioNode {
  type: OscillatorType = "sine";
  start = vi.fn();
  stop = vi.fn();
}

export class FakeGainNode extends FakeAudioNode {}

export class FakeBiquadFilterNode extends FakeAudioNode {
  type: BiquadFilterType = "lowpass";
  frequency = new FakeAudioParam();
}

export class FakeAudioBufferSourceNode extends FakeAudioNode {
  buffer: AudioBuffer | null = null;
  loop = false;
  start = vi.fn();
  stop = vi.fn();
}

export class FakeAudioBuffer implements AudioBuffer {
  readonly duration: number;
  readonly length: number;
  readonly numberOfChannels: number;
  readonly sampleRate: number;
  private readonly channels: Float32Array<ArrayBuffer>[];

  constructor(numberOfChannels: number, length: number, sampleRate: number) {
    this.duration = length / sampleRate;
    this.length = length;
    this.numberOfChannels = numberOfChannels;
    this.sampleRate = sampleRate;
    this.channels = Array.from(
      { length: numberOfChannels },
      () =>
        new Float32Array<ArrayBuffer>(
          new ArrayBuffer(length * Float32Array.BYTES_PER_ELEMENT),
        ),
    );
  }

  getChannelData(channelNumber: number): Float32Array<ArrayBuffer> {
    const channel = this.channels[channelNumber];
    if (!channel) throw new RangeError("Invalid audio channel");
    return channel;
  }

  copyFromChannel(
    destination: Float32Array,
    channelNumber: number,
    bufferOffset = 0,
  ) {
    const source = this.getChannelData(channelNumber);
    destination.set(source.subarray(bufferOffset, bufferOffset + destination.length));
  }

  copyToChannel(
    source: Float32Array,
    channelNumber: number,
    bufferOffset = 0,
  ) {
    const destination = this.getChannelData(channelNumber);
    destination.set(source.subarray(0, destination.length - bufferOffset), bufferOffset);
  }
}

export class FakeAudioContext {
  static instances: FakeAudioContext[] = [];

  state: AudioContextState = "suspended";
  currentTime = 12;
  sampleRate = 44_100;
  destination = new FakeAudioNode();

  constructor() {
    FakeAudioContext.instances.push(this);
  }

  readonly resume = vi.fn(async () => {
    this.state = "running";
  });
  readonly suspend = vi.fn(async () => {
    this.state = "suspended";
  });
  readonly close = vi.fn(async () => {
    this.state = "closed";
  });

  createGain = vi.fn(() => new FakeGainNode());
  createOscillator = vi.fn(() => new FakeOscillatorNode());
  createBuffer = vi.fn(
    (channels: number, length: number) =>
      new FakeAudioBuffer(channels, length, this.sampleRate),
  );
  createBufferSource = vi.fn(() => new FakeAudioBufferSourceNode());
  createBiquadFilter = vi.fn(() => new FakeBiquadFilterNode());
}

export function installFakeAudioContext() {
  FakeAudioContext.instances = [];
  const constructor = vi.fn(function FakeAudioContextConstructor() {
    return new FakeAudioContext();
  });
  Object.defineProperty(window, "AudioContext", {
    configurable: true,
    writable: true,
    value: constructor,
  });
  Object.defineProperty(globalThis, "AudioContext", {
    configurable: true,
    writable: true,
    value: constructor,
  });
  return constructor;
}
import { vi } from "vitest";

