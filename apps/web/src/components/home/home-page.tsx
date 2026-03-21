import { Navbar } from "./navbar";
import { HeroSection } from "./hero-section";
import { FeaturedPhotographers } from "./featured-photographers";
import { AiFeatureIntro } from "./ai-feature-intro";
import { HowItWorks } from "./how-it-works";
import { PortfolioShowcase } from "./portfolio-showcase";
import { CtaSection } from "./cta-section";
import { Footer } from "./footer";

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-brand-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedPhotographers />
        <AiFeatureIntro />
        <HowItWorks />
        <PortfolioShowcase />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};
