export class FakeLenis {
  static instances: FakeLenis[] = [];
  raf = vi.fn();
  on = vi.fn();
  destroy = vi.fn();

  constructor() {
    FakeLenis.instances.push(this);
  }
}

export function installLenisMock() {
  vi.mock("lenis", () => ({ default: FakeLenis }));
}
import { vi } from "vitest";

