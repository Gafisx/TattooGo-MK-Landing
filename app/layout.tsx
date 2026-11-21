import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono, Caveat } from "next/font/google"; // <-- AQUI
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

// A FONTE OFICIAL DO APP
const caveat = Caveat({
  weight: ["400", "700"], // Caveat tem pesos diferentes, o app deve usar o 700 (Bold) para ficar mais visível
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tattoogo.mk"),
  title: { default: "TattooGo MK", template: "%s | TattooGo MK" },
  description: "TattooGo MK conecta artistas e clientes com segurança, agilidade e uma experiência premium.",
  keywords: ["tattoo", "tatuagem", "artista", "TattooGo", "Macedonia"],
  applicationName: "TattooGo MK",
  authors: [{ name: "TattooGo MK" }],
  creator: "TattooGo MK",
  publisher: "TattooGo MK",
  robots: { index: true, follow: true },
  openGraph: { type: "website", locale: "pt_BR", url: "https://tattoogo.mk", siteName: "TattooGo MK", title: "TattooGo MK", description: "TattooGo MK conecta artistas e clientes com segurança, agilidade e uma experiência premium." },
  twitter: { card: "summary_large_image", title: "TattooGo MK", description: "TattooGo MK conecta artistas e clientes com segurança, agilidade e uma experiência premium." },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} h-full`} // <-- AQUI
    >
      <body className="min-h-full bg-[#121212] text-white antialiased overflow-x-hidden">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}