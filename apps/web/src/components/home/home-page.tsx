import { Navbar } from "./navbar";
import { HeroSection } from "./hero-section";
import { RoleIntro } from "./role-intro";
import { FeaturedPhotographers } from "./featured-photographers";
import { AiFeatureIntro } from "./ai-feature-intro";
import { HowItWorks } from "./how-it-works";
import { PortfolioShowcase } from "./portfolio-showcase";
import { CtaSection } from "./cta-section";
import { Footer } from "./footer";

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <RoleIntro />
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
