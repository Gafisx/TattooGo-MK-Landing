import type { Metadata } from "next";
import ArtistsHero from "@/components/artists/ArtistsHero";
import ArtistsDashboard from "@/components/artists/ArtistsDashboard";
import PageTransition from "@/components/PageTransition";
import SubpageShell from "@/components/SubpageShell";

export const metadata: Metadata = {
  title: "Para Tatuadores",
  description:
    "Painel profissional com agenda, custódia escrow e previsibilidade de caixa para estúdios e tatuadores independentes.",
};

export default function TatuadoresPage() {
  return (
    <PageTransition>
      <SubpageShell activeRoute="/tatuadores">
        <ArtistsHero />
        <ArtistsDashboard />
      </SubpageShell>
    </PageTransition>
  );
}
