"use client";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

import { Navbar } from "../../../components/home/navbar";
import { Footer } from "../../../components/home/footer";
import { Container } from "../../../components/layout/container";
import { Section } from "../../../components/common/section";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { photographerService } from "../../../services/photographer.service";
import { PhotographerAboutSection } from "./photographer-about-section";
import { PhotographerDetailCta } from "./photographer-detail-cta";
import { PhotographerDetailHero } from "./photographer-detail-hero";
import { PhotographerNotFound } from "./photographer-not-found";
import { PhotographerPortfolioSection } from "./photographer-portfolio-section";
import { PhotographerServicesSection } from "./photographer-services-section";
import { PhotographerTestimonialsSection } from "./photographer-testimonials-section";

interface PhotographerDetailPageProps
{
  slug: string;
}

const PhotographerDetailPageSkeleton = () =>
{
  return (
    <>
      <Navbar />
      <main className="pb-16 pt-10">
        <Container className="space-y-8">
          <div className="h-5 w-32 animate-pulse rounded bg-border/60" />
          <div className="h-72 animate-pulse rounded-[2rem] border border-border bg-surface/60" />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <div className="h-56 animate-pulse rounded-[2rem] border border-border bg-surface/60" />
              <div className="h-80 animate-pulse rounded-[2rem] border border-border bg-surface/60" />
            </div>
            <div className="h-64 animate-pulse rounded-[2rem] border border-border bg-surface/60" />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
};

export const PhotographerDetailPage = ({
  slug,
}: PhotographerDetailPageProps) =>
{
  const photographerQuery = useQuery({
    queryKey: ["public-photographer-detail", slug],
    queryFn: () => photographerService.getPublicPhotographerDetailBySlug(slug),
    retry: false,
  });

  if (photographerQuery.isLoading) {
    return <PhotographerDetailPageSkeleton />;
  }

  if (photographerQuery.isError) {
    return (
      <>
        <Navbar />
        <main className="pb-16 pt-10">
          <Container>
            <Card className="rounded-[2rem] border-border bg-surface shadow-sm">
              <CardContent className="space-y-4 p-8">
                <div className="space-y-2">
                  <h1 className="font-serif text-3xl text-foreground">
                    We couldn’t load this photographer
                  </h1>

                  <p className="text-sm leading-6 text-muted">
                    Please try again in a moment.
                  </p>
                </div>

                <Button
                  type="button"
                  className="rounded-full"
                  onClick={() => photographerQuery.refetch()}
                >
                  Try again
                </Button>
              </CardContent>
            </Card>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  const photographer = photographerQuery.data;

  return (
    <>
      <Navbar />
      <main className="pb-16 pt-10">
        <Container className="space-y-8">
          {photographer ? (
            <>
              <Section className="space-y-8">
                <Link
                  href="/photographers"
                  className="text-sm font-medium text-muted transition hover:text-foreground"
                >
                  Back to photographers
                </Link>

                <PhotographerDetailHero photographer={photographer} />

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-6">
                    <PhotographerAboutSection photographer={photographer} />
                    <PhotographerPortfolioSection photographer={photographer} />

                    {photographer.services.length ? (
                      <PhotographerServicesSection photographer={photographer} />
                    ) : null}

                    {photographer.testimonials.length ? (
                      <PhotographerTestimonialsSection photographer={photographer} />
                    ) : null}
                  </div>

                  <div className="space-y-6">
                    <PhotographerDetailCta photographer={photographer} />
                  </div>
                </div>
              </Section>
            </>
          ) : (
            <PhotographerNotFound />
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
};