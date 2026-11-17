import HeroSection from "@/components/HeroSection";
import DualSidedSection from "@/components/DualSidedSection";
import SecurityAndFooter from "@/components/SecurityAndFooter";
import ImmersiveExperience from "@/components/ImmersiveExperience";
import MasterTattooEngine from "@/components/MasterTattooEngine";

export default function Home() {
  return (
    <main>
      <MasterTattooEngine>
        <HeroSection />
        <ImmersiveExperience />
        <DualSidedSection />
        <SecurityAndFooter />
      </MasterTattooEngine>
    </main>
  );
}
