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
          className="flex min-h-[calc(100vh-140px)] scroll-mt-24 items-center justify-center bg-[#121212] py-16"
        >
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-slate-800/40 backdrop-blur-2xl border border-slate-300/30 px-10 py-14 shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-center max-w-sm w-full mx-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-700/50 border border-slate-400/20">
              <Lock aria-hidden="true" className="h-9 w-9 text-slate-300" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#FF6600]">Em Breve</span>
              <h1 className="text-2xl font-bold text-slate-200">Download do App</h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                O TattooGo MK está chegando para iOS e Android. Entre na lista VIP para receber o convite primeiro!
              </p>
            </div>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="mt-2 w-full rounded-xl bg-slate-700/50 border border-slate-600/50 px-6 py-3 text-sm font-medium text-slate-400 cursor-not-allowed select-none"
            >
              Disponível em breve na App Store e Google Play
            </button>
            <Link
              href="/#waitlist"
              transitionTypes={["nav-back"]}
              className="w-full rounded-xl bg-[#FF9900] px-6 py-3 text-sm font-semibold text-[#121212] transition-colors hover:bg-[#FF6600] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF9900]"
            >
              Entrar na Lista VIP
            </Link>
          </div>
        </section>
      </SubpageShell>
    </PageTransition>
  );
}
