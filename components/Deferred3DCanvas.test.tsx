import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Deferred3DCanvas from "@/components/Deferred3DCanvas";

vi.mock("next/dynamic", () => ({
  default: () => function MockMaster3DCanvas() {
    return <div data-testid="master-3d-canvas" />;
  },
}));

describe("Deferred3DCanvas", () => {
  it("monta a cena carregada dinamicamente no cliente", () => {
    render(<Deferred3DCanvas />);
    expect(screen.getByTestId("master-3d-canvas")).toBeInTheDocument();
  });
});
