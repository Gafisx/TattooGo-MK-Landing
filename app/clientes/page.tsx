import type { Metadata } from "next";
import ClientsHero from "@/components/clients/ClientsHero";
import ClientFeatures from "@/components/clients/ClientFeatures";
import ClientStyles from "@/components/clients/ClientStyles";
import SecuritySection from "@/components/SecuritySection";
import PageTransition from "@/components/PageTransition";
import SubpageShell from "@/components/SubpageShell";

export const metadata: Metadata = {
  title: "Para Clientes",
  description:
    "Explore estilos com Assistente de IA (TattooGo Studio), navegue pelo Mapa Imersivo e converse direto para pedir orçamentos no TattooGo MK.",
};

export default function ClientesPage() {
  return (
    <PageTransition>
      <SubpageShell activeRoute="/clientes">
        <ClientsHero />
        <ClientFeatures />
        <ClientStyles />
        <SecuritySection variant="client" />
      </SubpageShell>
    </PageTransition>
  );
}
