"use client";

export default function ReducedMotionFallback() {
  return (
    <div
      data-testid="reduced-motion-fallback"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#121212]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 45%, rgba(255, 102, 0, 0.16), transparent 58%), radial-gradient(ellipse at 15% 80%, rgba(0, 255, 102, 0.08), transparent 45%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-transparent via-[#121212]/50 to-[#121212]"
      />
    </div>
  );
}
