"use client";

import AccordionGallery from "@/components/ui/AccordionGallery";

const styles = [
  { image: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=1000&auto=format&fit=crop", label: "Realismo" },
  { image: "https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=1000&auto=format&fit=crop", label: "Old School" },
  { image: "https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=1000&auto=format&fit=crop", label: "Blackwork" },
  { image: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=1000&auto=format&fit=crop", label: "Aquarela" },
  { image: "https://images.unsplash.com/photo-1612459284970-e8f027596582?q=80&w=1000&auto=format&fit=crop", label: "Fine Line" },
];

export default function ClientStyles() {
  return (
    <section id="estilos" className="relative py-24 bg-[#121212] overflow-hidden">
      <div className="mx-auto max-w-5xl px-5 text-center mb-16">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-[#FF9900] mb-4">
          Estilos · TattooGo Studio
        </p>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6600]/25 bg-[#FF6600]/8 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#FF9900] mb-6 shadow-[0_0_12px_rgba(255,102,0,0.12)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF6600] shadow-[0_0_8px_#FF6600]" aria-hidden="true" />
          Estilos de tatuagem
        </div>
        <h2 className="text-4xl md:text-6xl font-serif text-white mb-4">Descubra seu Estilo</h2>
        <p className="text-slate-300 text-lg">Explore as linguagens da tatuagem e encontre a arte que traduz quem você é.</p>
      </div>
      <AccordionGallery items={styles} />
    </section>
  );
}
