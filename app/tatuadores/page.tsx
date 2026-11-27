import type { Metadata } from "next";
import ArtistsHero from "@/components/artists/ArtistsHero";
import ArtistFeatures from "@/components/artists/ArtistFeatures";
import SecuritySection from "@/components/SecuritySection";
import PageTransition from "@/components/PageTransition";
import SubpageShell from "@/components/SubpageShell";

export const metadata: Metadata = {
  title: "Para Tatuadores",
  description:
    "Portfólio verificado, gestão de agenda e recebimentos transparentes no PWA para estúdios e tatuadores independentes.",
};

export default function TatuadoresPage() {
  return (
    <PageTransition>
      <SubpageShell>
        <ArtistsHero />
        <ArtistFeatures />
        <SecuritySection variant="artist" />
      </SubpageShell>
    </PageTransition>
  );
}
