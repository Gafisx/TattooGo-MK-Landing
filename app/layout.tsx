import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tattoogo.mk"),
  title: {
    default: "TattooGo MK",
    template: "%s | TattooGo MK",
  },
  description:
    "TattooGo MK conecta artistas e clientes com segurança, agilidade e uma experiência premium.",
  keywords: ["tattoo", "tatuagem", "artista", "TattooGo", "Macedonia"],
  applicationName: "TattooGo MK",
  authors: [{ name: "TattooGo MK" }],
  creator: "TattooGo MK",
  publisher: "TattooGo MK",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://tattoogo.mk",
    siteName: "TattooGo MK",
    title: "TattooGo MK",
    description:
      "TattooGo MK conecta artistas e clientes com segurança, agilidade e uma experiência premium.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TattooGo MK",
    description:
      "TattooGo MK conecta artistas e clientes com segurança, agilidade e uma experiência premium.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full bg-[#121212] text-white antialiased overflow-x-hidden">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
