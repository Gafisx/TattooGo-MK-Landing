"use client";

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PenTool, Download, Palette, Users, Home, X, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

const MENU_ITEMS = [
  { id: "home", icon: Home, label: "Início", href: "/" },
  { id: "clientes", icon: Users, label: "Para Clientes", href: "/clientes" },
  { id: "artists", icon: Palette, label: "Para Tatuadores", href: "/tatuadores" },
  { id: "download", icon: Download, label: "Baixar o App", href: "/download" },
];

export default function TattooMenu() {
  // Guarda a rota em que o menu foi aberto; ao navegar, fecha sem useEffect nem ref no render.
  const [openPathname, setOpenPathname] = useState<string | null>(null);
  // useSyncExternalStore: retorna false no servidor, true no cliente — sem useEffect.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const isOpen = openPathname === pathname;

  const closeMenu = useCallback(() => setOpenPathname(null), []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeMenu]);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div
      ref={menuRef}
      className="fixed bottom-24 sm:bottom-6 right-6 z-50 flex flex-col items-end gap-3"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col gap-3 mb-2"
            role="menu"
          >
            {/* Botão de tema */}
            <motion.button
              onClick={toggleTheme}
              role="menuitem"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0, type: "spring", stiffness: 400, damping: 20 }}
              className="group relative flex items-center justify-center h-12 w-12 rounded-full bg-slate-800/40 backdrop-blur-xl border border-slate-400/20 text-white shadow-lg hover:bg-slate-700/50 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF6600] transition-all"
              aria-label={mounted && resolvedTheme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5 text-slate-300 group-hover:text-[#FF9900] transition-colors" />
              ) : (
                <Moon className="h-5 w-5 text-slate-300 group-hover:text-[#4977FF] transition-colors" />
              )}
              <span className="absolute right-16 whitespace-nowrap rounded-lg bg-slate-800/90 px-3 py-1.5 text-xs font-medium text-slate-200 opacity-0 shadow-xl border border-slate-600/50 transition-all group-hover:opacity-100 group-hover:-translate-x-1 pointer-events-none">
                {mounted && resolvedTheme === "dark" ? "Tema claro" : "Tema escuro"}
              </span>
            </motion.button>

            {/* Links de navegação */}
            {MENU_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{
                    delay: (index + 1) * 0.05,
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                  }}
                >
                  <Link
                    href={item.href}
                    role="menuitem"
                    transitionTypes={["nav-forward"]}
                    className={`group relative flex items-center justify-center h-12 w-12 rounded-full backdrop-blur-xl border shadow-lg hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF6600] transition-all ${
                      isActive
                        ? "bg-[#FF6600]/20 border-[#FF6600]/50"
                        : "bg-slate-800/40 border-slate-400/20 hover:bg-slate-700/50"
                    }`}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon
                      className={`h-5 w-5 transition-colors ${
                        isActive
                          ? "text-[#FF6600]"
                          : "text-slate-300 group-hover:text-[#FF6600]"
                      }`}
                    />
                    <span className="absolute right-16 whitespace-nowrap rounded-lg bg-slate-800/90 px-3 py-1.5 text-xs font-medium text-slate-200 opacity-0 shadow-xl border border-slate-600/50 transition-all group-hover:opacity-100 group-hover:-translate-x-1 pointer-events-none">
                      {item.label}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpenPathname((prev) => (prev === pathname ? null : pathname))}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        className="group flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/40 backdrop-blur-2xl border border-slate-300/30 text-white shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:bg-slate-700/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF6600] transition-colors"
        whileTap={{ scale: 0.92 }}
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {isOpen ? (
          <X className="h-7 w-7 text-[#FF6600]" />
        ) : (
          <PenTool className="h-7 w-7 text-slate-200 group-hover:text-[#00FF66] transition-colors" />
        )}
      </motion.button>
    </div>
  );
}
