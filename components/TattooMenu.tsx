"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PenTool, Download, Palette, Users, HelpCircle, X } from "lucide-react";

const MENU_ITEMS = [
  { id: "download", icon: Download, label: "Baixar o App" },
  { id: "artists", icon: Palette, label: "Para Tatuadores" },
  { id: "clients", icon: Users, label: "Para Clientes" },
  { id: "help", icon: HelpCircle, label: "Dúvidas / Suporte" },
];

export default function TattooMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setIsOpen(false), []);

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
            {MENU_ITEMS.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  role="menuitem"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                  }}
                  className="group relative flex items-center justify-center h-12 w-12 rounded-full bg-slate-800/40 backdrop-blur-xl border border-slate-400/20 text-white shadow-lg hover:bg-slate-700/50 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF6600] transition-all"
                  aria-label={item.label}
                >
                  <Icon className="h-5 w-5 text-slate-300 group-hover:text-[#FF6600] transition-colors" />

                  <span className="absolute right-16 whitespace-nowrap rounded-lg bg-slate-800/90 px-3 py-1.5 text-xs font-medium text-slate-200 opacity-0 shadow-xl border border-slate-600/50 transition-all group-hover:opacity-100 group-hover:-translate-x-1 pointer-events-none">
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
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
