import Link from "next/link";
import type { ReactNode } from "react";

type SubpageShellProps = {
  children: ReactNode;
  activeRoute: "/clientes" | "/tatuadores" | "/download";
};

const NAV_LINKS = [
  { href: "/", label: "Início", transition: "nav-back" },
  { href: "/clientes", label: "Para Clientes", transition: "nav-forward" },
  { href: "/tatuadores", label: "Para Tatuadores", transition: "nav-forward" },
  { href: "/download", label: "Download", transition: "nav-forward" },
] as const;

export default function SubpageShell({
  children,
  activeRoute,
}: SubpageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#121212] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#121212]/80 backdrop-blur-xl">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[#FF9900] focus:px-4 focus:py-3 focus:font-semibold focus:text-[#121212] focus:outline-2 focus:outline-offset-2 focus:outline-white"
        >
          Pular para o conteúdo
        </a>

        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 sm:px-10 lg:px-16">
          <Link
            href="/"
            transitionTypes={["nav-back"]}
            className="text-lg font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF9900]"
          >
            <span className="bg-linear-to-r from-[#FF6600] via-[#FF9900] to-[#00FF66] bg-clip-text text-transparent">
              TattooGo MK
            </span>
          </Link>

          <nav aria-label="Navegação principal">
            <ul className="flex flex-wrap items-center gap-4 text-xs font-medium sm:gap-6 sm:text-sm">
              {NAV_LINKS.map((item) => {
                const isActive = activeRoute === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      transitionTypes={[item.transition]}
                      aria-current={isActive ? "page" : undefined}
                      className={`transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF9900] ${
                        isActive
                          ? "text-[#FF9900]"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  href="/#waitlist"
                  transitionTypes={["nav-back"]}
                  className="inline-flex rounded-full border border-[#FF9900]/45 bg-[#FF6600]/15 px-3.5 py-1.5 text-xs font-semibold text-[#FF9900] transition-colors hover:bg-[#FF6600] hover:text-[#121212] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF9900]"
                >
                  Lista VIP
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>

      <footer className="border-t border-white/10 bg-[#121212]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 py-8 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
          <p>© {new Date().getFullYear()} Gafisx Labs. TattooGo MK.</p>
          <div className="flex flex-wrap gap-6">
            <Link href="/" transitionTypes={["nav-back"]} className="hover:text-[#FF9900]">
              Voltar para a Home
            </Link>
            <Link href="/#waitlist" transitionTypes={["nav-back"]} className="hover:text-[#FF9900]">
              Entrar na Lista VIP
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
