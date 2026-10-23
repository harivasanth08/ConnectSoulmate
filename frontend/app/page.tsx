import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import WhyConnectSoulmate from "@/components/landing/WhyConnectSoulmate";
import HowItWorks from "@/components/landing/HowItWorks";
import AIMatchmaker from "@/components/landing/AIMatchmaker";
import SuccessStories from "@/components/landing/SuccessStories";
import ContactSection from "@/components/landing/ContactSection";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="bg-[var(--background)] overflow-hidden">
        {/* Hero keeps its own wedding background */}
        <HeroSection />

        {/* Everything below Hero shares one unified continuous background */}
        <div className="site-sections relative overflow-hidden bg-[var(--background)]">
          <WhyConnectSoulmate />
          <HowItWorks />
          <AIMatchmaker />
          <SuccessStories />
          <ContactSection />
          <FinalCTA />
          <Footer />
        </div>
      </main>
    </>
  );
}