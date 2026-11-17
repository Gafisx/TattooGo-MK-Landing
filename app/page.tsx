import HeroSection from "@/components/HeroSection";
import DualSidedSection from "@/components/DualSidedSection";
import SecurityAndFooter from "@/components/SecurityAndFooter";
import ImmersiveExperience from "@/components/ImmersiveExperience";
import Master3DCanvas from "@/components/Master3DCanvas";

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
