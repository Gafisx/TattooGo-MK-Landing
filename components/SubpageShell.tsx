import Link from "next/link";
import type { ReactNode } from "react";
import TattooGoBrand from "@/components/ui/TattooGoBrand";

type SubpageShellProps = {
  children: ReactNode;
};

/**
 * Casca compartilhada das subpáginas. A barra superior é única e global
 * (`AppleTopBar` no `app/layout.tsx`), resolvida por rota — este shell apenas
 * reserva o espaço da barra fixa e mantém o esqueleto/footer.
 */
export default function SubpageShell({ children }: SubpageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#121212] text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[#FF9900] focus:px-4 focus:py-3 focus:font-semibold focus:text-[#121212] focus:outline-2 focus:outline-offset-2 focus:outline-white"
      >
        Pular para o conteúdo
      </a>

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 pt-[calc(env(safe-area-inset-top,0px)+3.5rem)] outline-none"
      >
        {children}
      </main>

      <footer className="border-t border-white/10 bg-[#121212] shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 py-8 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <TattooGoBrand size="sm" />
            <p>© {new Date().getFullYear()} Gafisx Labs.</p>
          </div>
          <div className="flex flex-wrap gap-6">
            <Link href="/" transitionTypes={["nav-back"]} className="hover:text-[#FF9900] transition-colors duration-200">
              Voltar para a Home
            </Link>
            <Link href="/#waitlist" transitionTypes={["nav-back"]} className="hover:text-[#FF9900] transition-colors duration-200">
              Entrar na Lista VIP
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
