"use client";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

import { Container } from "../layout/container";
import { Badge } from "../ui/badge";
import { buttonVariants } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { photographerService } from "../../services/photographer.service";

const FeaturedPhotographersSkeleton = () =>
{
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-[20rem] animate-pulse rounded-[2rem] border border-border bg-surface/70"
        />
      ))}
    </div>
  );
};

export const FeaturedPhotographers = () =>
{
  const featuredQuery = useQuery({
    queryKey: ["home-featured-photographers"],
    queryFn: () => photographerService.getPublicPhotographers({ limit: 3 }),
    retry: false,
  });

  const photographers = featuredQuery.data ?? [];

  return (
    <section className="pb-16 pt-6">
      <Container className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <Badge variant="neutral">Featured discovery</Badge>

            <div className="space-y-2">
              <h2 className="font-serif text-4xl text-foreground">
                Public photographers ready to compare
              </h2>

              <p className="max-w-2xl text-sm leading-7 text-muted">
                Real public profiles, AI-detected style signals,
                and faster entry into the photographers list.
              </p>
            </div>
          </div>

          <Link
            href="/photographers"
            className={buttonVariants({
              variant: "secondary",
              className: "rounded-full",
            })}
          >
            See all photographers
          </Link>
        </div>

        {featuredQuery.isLoading ? (
          <FeaturedPhotographersSkeleton />
        ) : featuredQuery.isError ? (
          <Card className="rounded-[2rem] border-border bg-surface shadow-sm">
            <CardContent className="space-y-4 p-8">
              <h3 className="font-serif text-2xl text-foreground">
                We couldn’t load featured photographers
              </h3>

              <p className="text-sm leading-6 text-muted">
                Please try again in a moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {photographers.map((photographer) => (
              <Card
                key={photographer.id}
                className="rounded-[2rem] border-border bg-surface shadow-sm"
              >
                <CardContent className="space-y-5 p-6">
                  <div className="flex flex-wrap gap-2">
                    {photographer.primaryDiscoveryStyle ? (
                      <Badge variant="ai">
                        {photographer.primaryDiscoveryStyle}
                      </Badge>
                    ) : null}

                    {photographer.hasFeaturedWork ? (
                      <Badge variant="accent">
                        Featured work
                      </Badge>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-serif text-3xl text-foreground">
                      {photographer.name}
                    </h3>

                    <p className="text-sm text-muted">
                      {photographer.location}
                    </p>
                  </div>

                  <p className="text-sm leading-7 text-muted">
                    {photographer.bio}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {(photographer.discoveryStyles.length
                      ? photographer.discoveryStyles
                      : photographer.styles
                    )
                      .slice(0, 3)
                      .map((style) => (
                        <Badge key={style} variant="neutral">
                          {style}
                        </Badge>
                      ))}
                  </div>

                  <Link
                    href={`/photographers/${photographer.slug}`}
                    className={buttonVariants({
                      size: "lg",
                      className: "w-full rounded-full",
                    })}
                  >
                    View profile
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
};