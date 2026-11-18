"use client";

import dynamic from "next/dynamic";
import HeroSection from "@/components/HeroSection";
import DualSidedSection from "@/components/DualSidedSection";
import SecurityAndFooter from "@/components/SecurityAndFooter";
import ImmersiveExperience from "@/components/ImmersiveExperience";

const Master3DCanvas = dynamic(
  () => import("@/components/Master3DCanvas"),
  {
    ssr: false,
    loading: () => null,
  },
);

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <Master3DCanvas />
      <div className="relative z-10">
        <HeroSection />
        <ImmersiveExperience />
        <DualSidedSection />
        <SecurityAndFooter />
      </div>
    </main>
  );
}
