import HeroSection from "@/components/HeroSection";
import DualSidedSection from "@/components/DualSidedSection";
import SecurityAndFooter from "@/components/SecurityAndFooter";
import ImmersiveExperience from "@/components/ImmersiveExperience";
import Deferred3DCanvas from "@/components/Deferred3DCanvas";

export default function Home() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[#FF9900] focus:px-4 focus:py-3 focus:font-semibold focus:text-[#121212] focus:outline-2 focus:outline-offset-2 focus:outline-white"
      >
        Pular para o conteúdo
      </a>
      <Deferred3DCanvas />
      <main
        id="main-content"
        tabIndex={-1}
        className="relative min-h-screen outline-none"
      >
        <div className="relative z-10">
          <HeroSection />
          <ImmersiveExperience />
          <DualSidedSection />
          <SecurityAndFooter />
        </div>
      </main>
    </>
  );
}
