import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono, Great_Vibes } from "next/font/google"; // <-- IMPORT AQUI
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// NOVA FONTE PARA A LOGO
const greatVibes = Great_Vibes({
  weight: "400",
  variable: "--font-great-vibes",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // ... (mantenha o resto do seu metadata)
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${greatVibes.variable} h-full`} // <-- VARIÁVEL AQUI
    >
      <body className="min-h-full bg-[#121212] text-white antialiased overflow-x-hidden">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}