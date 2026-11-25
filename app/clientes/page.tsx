import ClientsHero from "@/components/clients/ClientsHero";
import ClientStyles from "@/components/clients/ClientStyles";

export default function ClientesPage() {
  return (
    <main className="min-h-screen bg-[#121212]">
      <ClientsHero />
      <ClientStyles />
    </main>
  );
}
