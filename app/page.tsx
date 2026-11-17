import HeroSection from "@/components/HeroSection";
import DualSidedSection from "@/components/DualSidedSection";
import SecurityAndFooter from "@/components/SecurityAndFooter";
import TattooScrollSection from "@/components/TattooScrollSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <TattooScrollSection />
      <DualSidedSection />
      <SecurityAndFooter />
    </main>
  );
}
