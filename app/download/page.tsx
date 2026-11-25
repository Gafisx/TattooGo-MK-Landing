import { Lock } from "lucide-react";

export default function DownloadPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#121212]">
      <div className="flex flex-col items-center gap-6 rounded-2xl bg-slate-800/40 backdrop-blur-2xl border border-slate-300/30 px-10 py-14 shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-center max-w-sm w-full mx-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-700/50 border border-slate-400/20">
          <Lock className="h-9 w-9 text-slate-300" />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#FF6600]">Em Breve</span>
          <h1 className="text-2xl font-bold text-slate-200">Download do App</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            O TattooGo MK está chegando para iOS e Android. Fique de olho!
          </p>
        </div>
        <button
          disabled
          aria-disabled="true"
          className="mt-2 w-full rounded-xl bg-slate-700/50 border border-slate-600/50 px-6 py-3 text-sm font-medium text-slate-500 cursor-not-allowed select-none"
        >
          Disponível em breve na App Store e Google Play
        </button>
      </div>
    </main>
  );
}
