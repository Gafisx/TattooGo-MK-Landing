import HeroSection from "@/components/HeroSection";
import DualSidedSection from "@/components/DualSidedSection";
import SecurityAndFooter from "@/components/SecurityAndFooter";
import ImmersiveExperience from "@/components/ImmersiveExperience";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ImmersiveExperience />
      <DualSidedSection />
      <SecurityAndFooter />
    </main>
  );
}
