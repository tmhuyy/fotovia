import Link from "next/link";
import { Navbar } from "../../../components/home/navbar";
import { Footer } from "../../../components/home/footer";
import { Container } from "../../../components/layout/container";
import { Section } from "../../../components/common/section";
import type { PhotographerDetail } from "../types/photographer-detail.types";
import { PhotographerDetailHero } from "./photographer-detail-hero";
import { PhotographerDetailCta } from "./photographer-detail-cta";
import { PhotographerPortfolioSection } from "./photographer-portfolio-section";
import { PhotographerServicesSection } from "./photographer-services-section";
import { PhotographerTestimonialsSection } from "./photographer-testimonials-section";
import { PhotographerAboutSection } from "./photographer-about-section";
import { PhotographerNotFound } from "./photographer-not-found";

interface PhotographerDetailPageProps {
  photographer: PhotographerDetail | null;
}

export const PhotographerDetailPage = ({
  photographer,
}: PhotographerDetailPageProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Section className="pt-10">
          <Container className="space-y-8">
            {photographer ? (
              <>
                <Link
                  href="/photographers"
                  className="text-xs uppercase tracking-[0.3em] text-muted"
                >
                  Back to photographers
                </Link>
                <PhotographerDetailHero photographer={photographer} />
                <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                  <div className="space-y-6">
                    <PhotographerAboutSection photographer={photographer} />
                    <PhotographerPortfolioSection photographer={photographer} />
                    <PhotographerServicesSection photographer={photographer} />
                    <PhotographerTestimonialsSection photographer={photographer} />
                  </div>
                  <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                    <PhotographerDetailCta photographer={photographer} />
                  </div>
                </div>
              </>
            ) : (
              <PhotographerNotFound />
            )}
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  );
};
