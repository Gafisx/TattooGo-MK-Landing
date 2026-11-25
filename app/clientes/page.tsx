import type { Metadata } from "next";
import ClientsHero from "@/components/clients/ClientsHero";
import ClientStyles from "@/components/clients/ClientStyles";
import PageTransition from "@/components/PageTransition";
import SubpageShell from "@/components/SubpageShell";

export const metadata: Metadata = {
  title: "Para Clientes",
  description:
    "Explore estilos de tatuagem, compare portfólios verificados e encontre o artista ideal no TattooGo MK.",
};

export default function ClientesPage() {
  return (
    <PageTransition>
      <SubpageShell activeRoute="/clientes">
        <ClientsHero />
        <ClientStyles />
      </SubpageShell>
    </PageTransition>
  );
}
