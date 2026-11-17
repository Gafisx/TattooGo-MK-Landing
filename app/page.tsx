export default function Home() {
  return (
    <main className="gpu-accelerate flex min-h-screen items-center justify-center px-6">
      <section
        className="rounded-2xl border border-white/10 bg-[#1A1A1A] px-8 py-10 text-center"
        aria-label="Foundation status"
      >
        <h1 className="text-2xl font-semibold text-[#FF6600]">
          TattooGo MK Enterprise Foundation
        </h1>
        <p className="mt-3 text-sm text-white/70">
          Next.js App Router + TypeScript + Tailwind CSS + 120Hz GPU stack
        </p>
      </section>
    </main>
  );
}
