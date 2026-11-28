import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import SubpageShell from "@/components/SubpageShell";

export const metadata: Metadata = {
  title: "Download do App",
  description:
    "Em breve na App Store e Google Play. Entre na lista VIP do TattooGo MK para receber acesso antecipado.",
};

export default function DownloadPage() {
  return (
    <PageTransition>
      <SubpageShell>
        <section
          id="download-top"
          className="flex min-h-[calc(100vh-140px)] scroll-mt-24 items-center justify-center bg-[#121212] pt-16 pb-[calc(env(safe-area-inset-bottom,0px)+6rem)] sm:pb-16"
        >
          <div className="group relative flex flex-col items-center gap-6 rounded-2xl bg-slate-800/45 backdrop-blur-2xl border border-slate-300/30 px-10 py-14 shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-center max-w-sm w-full mx-4 transition-colors duration-300 hover:border-[#FF6600]/40 hover:shadow-[0_0_32px_rgba(255,102,0,0.15)]">
            {/* Aura sutil de marca no card */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-[#FF6600]/8 via-transparent to-[#00FF66]/6 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-slate-700/50 border border-slate-400/20 shadow-[0_0_20px_rgba(255,102,0,0.2)] transition-colors duration-300 group-hover:border-[#FF6600]/40 group-hover:shadow-[0_0_28px_rgba(255,102,0,0.3)]">
              <Lock aria-hidden="true" className="h-9 w-9 text-slate-300 drop-shadow-[0_0_12px_rgba(255,102,0,0.3)]" />
              {/* LED de status em breve */}
              <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border border-[#FF6600]/30 bg-[#FF6600]/15 shadow-[0_0_10px_rgba(255,102,0,0.3)]">
                <span className="h-2 w-2 rounded-full bg-[#FF6600] shadow-[0_0_6px_#FF6600] animate-pulse" aria-hidden="true" />
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#FF9900] shadow-[0_0_8px_#FF9900] inline-block" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-widest text-[#FF9900]">Em Breve</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-100">Download do App</h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                O TattooGo MK está chegando para iOS e Android. Entre na lista VIP para receber o convite primeiro!
              </p>
            </div>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="mt-2 w-full rounded-xl bg-slate-700/50 border border-slate-600/50 px-6 py-3 text-sm font-medium text-slate-400 cursor-not-allowed select-none shadow-[0_0_12px_rgba(0,0,0,0.3)]"
            >
              Disponível em breve na App Store e Google Play
            </button>
            <Link
              href="/#waitlist"
              transitionTypes={["nav-back"]}
              className="w-full rounded-xl bg-[#FF9900] px-6 py-3 text-sm font-semibold text-[#121212] transition-all duration-300 hover:bg-[#FF6600] hover:scale-[1.02] hover:shadow-[0_0_26px_rgba(255,102,0,0.3)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF9900]"
            >
              Entrar na Lista VIP
            </Link>
          </div>
        </section>
      </SubpageShell>
    </PageTransition>
  );
}
